---
inject: true
to: src/types/i18next.d.ts
after: import "i18next"
---
import <%= h.capitalize(type) %><%= name %> from "@/translations/en/<%= type %>/<%= name %>.json";