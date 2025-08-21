'use server';

/**
 * @fileOverview An AI agent for suggesting product descriptions for menu items.
 *
 * - suggestProductDescription - A function that generates a product description.
 * - SuggestProductDescriptionInput - The input type for the suggestProductDescription function.
 * - SuggestProductDescriptionOutput - The return type for the suggestProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., appetizers, main course, dessert).'),
  ingredients: z.string().describe('A list of the main ingredients in the product.'),
  existingDescription: z.string().optional().describe('An existing description of the product, if available.'),
});
export type SuggestProductDescriptionInput = z.infer<typeof SuggestProductDescriptionInputSchema>;

const SuggestProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A creative and appealing description for the product.'),
});
export type SuggestProductDescriptionOutput = z.infer<typeof SuggestProductDescriptionOutputSchema>;

export async function suggestProductDescription(input: SuggestProductDescriptionInput): Promise<SuggestProductDescriptionOutput> {
  return suggestProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductDescriptionPrompt',
  input: {schema: SuggestProductDescriptionInputSchema},
  output: {schema: SuggestProductDescriptionOutputSchema},
  prompt: `You are a creative marketing expert specializing in food and beverages.

  Your task is to generate an appealing and enticing product description for a menu item.

  Consider the product name, category, ingredients, and any existing description to craft a description that will attract customers.

  Product Name: {{{productName}}}
  Category: {{{productCategory}}}
  Ingredients: {{{ingredients}}}
  Existing Description: {{#if existingDescription}}{{{existingDescription}}}{{else}}None{{/if}}

  Description:`, // Handlebars template
});

const suggestProductDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestProductDescriptionFlow',
    inputSchema: SuggestProductDescriptionInputSchema,
    outputSchema: SuggestProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
