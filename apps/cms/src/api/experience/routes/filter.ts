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
        {
            method: "GET",
            path: "/experience/:id",                
            handler: "api::experience.filter.findById",         
            config: {auth: false,  },
        },
    ],
    
};
