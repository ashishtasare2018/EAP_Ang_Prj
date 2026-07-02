# Framework-Specific Security Patterns

## Angular Security

### XSS Prevention

```typescript
// SAFE - Angular auto-escapes interpolation and property bindings by default
template: `<div>{{ userInput }}</div>`
template: `<div [textContent]="userInput"></div>`

// DANGEROUS - binding raw HTML via [innerHTML] still passes through Angular's
// sanitizer, but is the highest-risk binding point; verify what's flowing in
template: `<div [innerHTML]="userInput"></div>`

// DANGEROUS - bypassing the sanitizer entirely. Any use of bypassSecurityTrust*
// is a manual override of Angular's XSS protection and should be treated as a
// CRITICAL finding unless the input is fully server-controlled/constant.
constructor(private sanitizer: DomSanitizer) {}
getSafeHtml(userInput: string) {
  return this.sanitizer.bypassSecurityTrustHtml(userInput); // DANGEROUS if userInput is user-controlled
}

// SAFE - sanitize explicitly if HTML rendering is required
import DOMPurify from 'dompurify';
get safeHtml() {
  return DOMPurify.sanitize(this.userInput);
}
```

Grep priority for Angular XSS review:
```bash
grep -rn "bypassSecurityTrust" --include="*.ts"
grep -rn "\[innerHTML\]" --include="*.html" --include="*.ts"
grep -rn "\.nativeElement\.innerHTML" --include="*.ts"
grep -rn "DomSanitizer" --include="*.ts"
```

### Direct DOM Access (ElementRef / Renderer2)

```typescript
// DANGEROUS - bypasses Angular's rendering layer and sanitizer entirely
constructor(private el: ElementRef) {}
setContent(userInput: string) {
  this.el.nativeElement.innerHTML = userInput; // DANGEROUS
}

// SAFE - use Renderer2, which still requires explicit sanitization for HTML,
// but at minimum avoids direct nativeElement manipulation for other properties
constructor(private renderer: Renderer2, private el: ElementRef) {}
setText(userInput: string) {
  this.renderer.setProperty(this.el.nativeElement, 'textContent', userInput);
}
```

### URL / Route Handling

```typescript
// DANGEROUS - resource URLs (script src, iframe src) require explicit trust
// and are a common bypass point
this.sanitizer.bypassSecurityTrustResourceUrl(userControlledUrl); // DANGEROUS

// SAFE - validate protocol before trusting
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### CSRF / XSRF Protection

```typescript
// Angular's HttpClient has built-in XSRF support, but it does nothing unless
// the backend sets the matching cookie/header names and it's actually enabled.

// app.module.ts / app.config.ts
import { HttpClientXsrfModule } from '@angular/common/http';

// DANGEROUS - default HttpClientModule import with no XSRF module means no
// CSRF token is attached to state-changing requests
imports: [HttpClientModule] // missing HttpClientXsrfModule

// SAFE - explicit XSRF config matching backend cookie/header names
imports: [
  HttpClientXsrfModule.withOptions({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
  }),
]
```

Grep priority for Angular CSRF review:
```bash
grep -rn "HttpClientModule" --include="*.ts"
grep -rn "HttpClientXsrfModule" --include="*.ts"
grep -rn "withXsrfConfiguration" --include="*.ts"
```
If `HttpClientModule`/`provideHttpClient` appears without a corresponding XSRF configuration anywhere in the module tree, flag it — the backend may be relying on Angular's default behavior that isn't actually wired up.

### Reactive Forms & Input Validation

```typescript
// DANGEROUS - trusting FormControl values without validators before use in
// requests, templates, or navigation
this.http.post('/api/search', { term: this.searchForm.value.term });

// SAFE - validators plus explicit sanitization/allowlisting for anything
// that reaches a URL, HTML binding, or backend query
this.searchForm = this.fb.group({
  term: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/^[\w\s-]*$/)]],
});
```

### Sensitive Data in State / Storage

```typescript
// DANGEROUS - storing JWTs or session data in localStorage, accessible to
// any injected script (defeats the purpose of XSS mitigations elsewhere)
localStorage.setItem('access_token', token); // DANGEROUS

// SAFE - httpOnly cookie set by the backend, or in-memory state (service
// singleton) cleared on refresh with a silent-refresh flow
```

### Route Guards

```typescript
// DANGEROUS - guard exists but doesn't actually block navigation, or checks
// a client-only flag that can be tampered with (e.g. a plain localStorage
// boolean) instead of validating a real token/session
canActivate(): boolean {
  return !!localStorage.getItem('isLoggedIn'); // DANGEROUS - trivially spoofed
}

// SAFE - guard defers to a real auth check (token validity, backend call, or
// a service that validates the token's signature/expiry client-side only as
// a UX hint, with the backend enforcing the real check)
canActivate(): boolean {
  return this.authService.hasValidSession();
}
```

## React Security

### XSS Prevention

```jsx
// DEFAULT SAFE - React escapes by default
<div>{userInput}</div>

// DANGEROUS - bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// If HTML is required, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### URL Handling

```jsx
// DANGEROUS - javascript: URLs in href
<a href={userInput}>Link</a>

// SAFE - validate URL protocol
function SafeLink({ href, children }) {
  const safeHref = useMemo(() => {
    try {
      const url = new URL(href, window.location.origin);
      if (['http:', 'https:', 'mailto:'].includes(url.protocol)) {
        return href;
      }
    } catch {}
    return '#';
  }, [href]);

  return <a href={safeHref}>{children}</a>;
}
```

### State and Props

```jsx
// DANGEROUS - spreading user-controlled props
<Component {...userControlledObject} />

// SAFE - explicitly pass allowed props
<Component
  title={userControlledObject.title}
  description={userControlledObject.description}
/>
```

### Server-Side Rendering (SSR)

```jsx
// DANGEROUS - injecting user data into SSR without escaping
<script>
  window.__INITIAL_STATE__ = {JSON.stringify(userControlledData)}
</script>

// SAFE - serialize with escaping
import serialize from 'serialize-javascript';
<script
  dangerouslySetInnerHTML={{
    __html: `window.__INITIAL_STATE__ = ${serialize(data, { isJSON: true })}`
  }}
/>
```

## Astro Security

### Content Escaping

```astro
---
const userInput = Astro.props.userInput;
---

<!-- SAFE - auto-escaped -->
<div>{userInput}</div>

<!-- DANGEROUS - bypasses escaping -->
<div set:html={userInput} />

<!-- If HTML required, sanitize -->
---
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(userInput);
---
<div set:html={sanitized} />
```

### Dynamic Imports

```astro
---
// DANGEROUS - user-controlled import path
const component = await import(userInput);

// SAFE - allowlist approach
const allowedComponents = {
  'card': () => import('./Card.astro'),
  'button': () => import('./Button.astro')
};

const loadComponent = allowedComponents[userInput];
if (!loadComponent) throw new Error('Invalid component');
const Component = await loadComponent();
---
```

### API Endpoints

```javascript
// src/pages/api/data.js
export async function POST({ request }) {
  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return new Response('Invalid content type', { status: 415 });
  }

  // Validate and sanitize input
  const body = await request.json();
  if (!validateInput(body)) {
    return new Response('Invalid input', { status: 400 });
  }

  // Process request
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## Twig Security

### Output Escaping

```twig
{# SAFE - auto-escaped for HTML context #}
{{ userInput }}

{# DANGEROUS - raw bypasses escaping #}
{{ userInput|raw }}

{# DANGEROUS - autoescape disabled #}
{% autoescape false %}
  {{ userInput }}
{% endautoescape %}

{# Context-specific escaping #}
{{ userInput|e('html') }}
{{ userInput|e('js') }}
{{ userInput|e('css') }}
{{ userInput|e('url') }}
{{ userInput|e('html_attr') }}
```

### Template Inclusion

```twig
{# DANGEROUS - user-controlled template path #}
{% include userInput %}

{# SAFE - use allowlist #}
{% if templateName in ['header', 'footer', 'sidebar'] %}
  {% include templateName ~ '.html.twig' %}
{% endif %}
```

### Sandbox Mode (Symfony)

```yaml
# config/packages/twig.yaml
twig:
  sandbox:
    policy:
      tags: ['if', 'for', 'set']
      filters: ['escape', 'upper', 'lower']
      methods:
        Symfony\Component\Routing\Generator\UrlGeneratorInterface: ['generate']
      properties: []
      functions: ['path', 'url']
```

### CSRF in Forms

```twig
{# Symfony CSRF protection #}
<form method="post">
  <input type="hidden" name="_csrf_token" value="{{ csrf_token('form_name') }}">
  {# form fields #}
</form>
```

## Bun Security

### Request Handling

```javascript
// Bun HTTP server
Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // Validate origin for CORS
    const origin = req.headers.get('origin');
    if (origin && !isAllowedOrigin(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Rate limiting
    if (isRateLimited(req)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    return handleRequest(req);
  }
});
```

### File Handling

```javascript
// Validate file paths
function safeReadFile(userPath) {
  const baseDir = '/app/public';
  const resolved = Bun.resolveSync(userPath, baseDir);

  if (!resolved.startsWith(baseDir)) {
    throw new Error('Path traversal detected');
  }

  return Bun.file(resolved).text();
}
```

## HTML5 APIs Security

### Web Storage

```javascript
// NEVER store sensitive data in localStorage
localStorage.setItem('token', jwt);  // DANGEROUS

// Use httpOnly cookies for tokens instead
// Or store in memory with short expiration

// If localStorage is necessary, encrypt
import { encrypt, decrypt } from './crypto';
localStorage.setItem('data', encrypt(sensitiveData, key));
```

### postMessage

```javascript
// Always validate origin and data
window.addEventListener('message', (event) => {
  // Validate origin
  const allowedOrigins = ['https://trusted.com'];
  if (!allowedOrigins.includes(event.origin)) return;

  // Validate data structure
  if (typeof event.data !== 'object') return;
  if (!['action1', 'action2'].includes(event.data.type)) return;

  handleMessage(event.data);
});

// Always specify target origin when sending
iframe.contentWindow.postMessage(data, 'https://specific-origin.com');
// NEVER use '*' for sensitive data
```

### WebSockets

```javascript
// Validate WebSocket origin
const wss = new WebSocket.Server({
  server,
  verifyClient: ({ origin, req }, callback) => {
    const allowed = ['https://myapp.com'];
    callback(allowed.includes(origin));
  }
});

// Validate messages
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (!isValidMessage(msg)) {
        ws.close(1008, 'Invalid message');
        return;
      }
      handleMessage(msg);
    } catch {
      ws.close(1008, 'Invalid JSON');
    }
  });
});
```

OWASP Reference: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
