export const ENVIRONMENT = process.env.NODE_ENV || "development";
//console.log(ENVIRONMENT);
ENVIRONMENT === "development" && console.log("You are running in DEV mode");
