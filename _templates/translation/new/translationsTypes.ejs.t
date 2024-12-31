---
inject: true
to: src/types/i18next.d.ts
after: // hygen-<%= type %>
---
      <%= h.capitalize(type) %><%= name %>: typeof <%= name %>;