import { z } from "zod"

export const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Fill in your email address" })
        .email("Enter a valid email.")
    // .refine(async (e) => {
    // Where checkIfEmailIsValid makes a request to the backend
    // to see if the email is valid.
    // return await checkIfEmailIsValid(e);
    //   }, "This email is not in our database")
    ,
    password: z.string()
})
