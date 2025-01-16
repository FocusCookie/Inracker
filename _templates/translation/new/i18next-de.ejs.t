---
inject: true
to: src/i18next.ts
after: // hygen-de-<%= type %>
---
    <%= h.capitalize(type) %><%= h.capitalize(name) %>: <%= h.capitalize(type) %><%= h.capitalize(name) %>DE,