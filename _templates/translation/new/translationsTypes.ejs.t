---
inject: true
to: src/types/i18next.d.ts
after: // hygen-<%= type %>
---
      <%= h.capitalize(type) %><%= h.capitalize(name) %>: typeof <%= h.capitalize(type) %><%= h.capitalize(name) %>;