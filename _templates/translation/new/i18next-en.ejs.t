---
inject: true
to: src/i18next.ts
after: // hygen-en-<%= type %>
---
    <%= h.capitalize(type) %><%= h.capitalize(name) %>: <%= h.capitalize(type) %><%= h.capitalize(name) %>EN,