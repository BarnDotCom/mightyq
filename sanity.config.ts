"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "mightyq",
  title: "The Mighty Q",
  basePath: "/studio",
  projectId: projectId || "missing",
  dataset,
  schema: {
    types: schemaTypes,
    // Site settings and the home page exist once; hide them from "new document".
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : input,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("The Mighty Q")
          .items([
            S.listItem().title("Home page").id("homePage").child(S.document().schemaType("homePage").documentId("homePage")),
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("wantedItem").title("Most wanted"),
            S.documentTypeListItem("teamMember").title("Team"),
            S.documentTypeListItem("legalPage").title("Legal pages"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
