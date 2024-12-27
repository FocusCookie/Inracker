---
inject: true
to: src/i18next.ts
after: import { initReactI18next } from "react-i18next";
---
import Component<%= name %>EN from "@/translations/en/components/<%= name %>.json";
import Component<%= name %>DE from "@/translations/de/components/<%= name %>.json"; 