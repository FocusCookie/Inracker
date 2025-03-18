---
inject: true
to: src/types/i18next.d.ts
after: import "i18next"
---
import <%= h.capitalize(type) %><%= h.capitalize(name) %> from "@/translations/en/<%= type %>/<%= name %>.json";