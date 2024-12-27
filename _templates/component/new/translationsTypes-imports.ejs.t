---
inject: true
to: src/types/i18next.d.ts
after: import "i18next"
---
import Component<%= name %> from "@/translations/en/components/<%= name %>.json";