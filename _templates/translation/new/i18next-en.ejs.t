---
inject: true
to: src/i18next.ts
after: // hygen-en-<%= type %>
---
    <%= h.capitalize(type) %><%= name %>: <%= h.capitalize(type) %><%= name %>EN,