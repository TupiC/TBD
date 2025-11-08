import type { Core } from "@strapi/strapi";
import fs from "fs";
import path from "path";

export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register(/* { strapi }: { strapi: Core.Strapi } */) {},

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    async bootstrap({ strapi }: { strapi: Core.Strapi }) {
        console.log("Starting experiences import...");
        return; // for now return dev if you want to reimport then copy the scraping/sc_cleaned.json to apps/cms/src/data/sc_cleaned.json and comment out this return

        const filePath = path.join(__dirname, "./data/sc_cleaned.json");
        const raw = fs.readFileSync(filePath, "utf-8");
        const items = JSON.parse(raw);

        console.log(`Found ${items.length} experiences to import.`);
        const existing = await strapi
            .documents("api::experience.experience")
            .findMany();
        console.log(
            `There are already ${existing.length} experiences in the database.`
        );
        if (existing.length > 0) {
            console.log("Some experiences already exist, skipping import...");
            return;
        }
        try {
            for (const experienceData of items) {
                const opened_months = {
                    start_month: experienceData.start_month,
                    end_month: experienceData.end_month,
                };
                delete experienceData.start_month;
                delete experienceData.end_month;
                experienceData.opened_months = opened_months;
                await strapi.documents("api::experience.experience").create({
                    data: experienceData,
                });
            }
        } catch (error) {
            console.error("Error importing experiences:", error);
        }
    },
};
