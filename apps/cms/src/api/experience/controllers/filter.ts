export default {
    filter: async (ctx) => {
        try {
            const { startDate, endDate, categories } = ctx.request.query as {
                startDate?: string;
                endDate?: string;
                categories?: string[];
            };

            if (!startDate || !endDate) {
                ctx.throw(400, "Both startDate and endDate must be provided");
            }

            if (new Date(startDate) > new Date(endDate)) {
                ctx.throw(400, "startDate cannot be later than endDate");
            }

            const startMonth = new Date(startDate).getMonth() + 1;
            const endMonth = new Date(endDate).getMonth() + 1;

            const experiences = await strapi
                .documents("api::experience.experience")
                .findMany({
                    filters: {
                        $and: [
                            {
                                opened_months: {
                                    start_month: { $lte: endMonth },
                                },
                            },
                            {
                                opened_months: {
                                    end_month: { $gte: startMonth },
                                },
                            },
                            ...(categories
                                ? [{ category: { $in: categories } }]
                                : []),
                        ],
                    },
                    populate: "*",
                    status: "published",
                });
            ctx.send(experiences);
        } catch (err) {
            console.error("Error in filter endpoint:", err);
            ctx.throw(500, err.message);
        }
    },
};
