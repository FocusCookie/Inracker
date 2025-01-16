---
inject: true
to: src/i18next.ts
after: import { initReactI18next } from "react-i18next";
---
import <%= h.capitalize(type) %><%= h.capitalize(name) %>EN from "@/translations/en/<%= h.inflection.pluralize(type) %>/<%= name %>.json";
import <%= h.capitalize(type) %><%= h.capitalize(name) %>DE from "@/translations/de/<%= h.inflection.pluralize(type) %>/<%= name %>.json"; 