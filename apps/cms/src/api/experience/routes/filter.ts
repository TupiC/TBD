export default {
    routes: [
        {
            method: "GET",
            path: "/experience/filter",
            handler: "api::experience.filter.filter",
            config: {
                auth: false,
            },
        },
    ],
    
};
