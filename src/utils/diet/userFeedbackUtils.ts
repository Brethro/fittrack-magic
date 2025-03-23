
// Function to submit feedback about food categories
export const submitCategoryFeedback = (
  foodItem: any,
  suggestedCategory: string,
  feedbackReason: string
): void => {
  console.log('Category feedback submitted:', { foodItem, suggestedCategory, feedbackReason });
};
