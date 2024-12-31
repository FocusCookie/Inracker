---
inject: true
to: src/i18next.ts
after: import { initReactI18next } from "react-i18next";
---
import <%= h.capitalize(type) %><%= name %>EN from "@/translations/en/<%= h.inflection.pluralize(type) %>/<%= name %>.json";
import <%= h.capitalize(type) %><%= name %>DE from "@/translations/de/<%= h.inflection.pluralize(type) %>/<%= name %>.json"; 