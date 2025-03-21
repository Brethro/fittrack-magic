
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FoodCategory, Meal } from "@/types/diet";
import { createBalancedMeal } from "@/utils/dietUtils";
import { FoodPreferences } from "@/components/diet/FoodPreferences";
import { MealPlanDisplay } from "@/components/diet/MealPlanDisplay";
import { EmptyStateMessage } from "@/components/diet/EmptyStateMessage";

const DietPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState("preferences");
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [includeFreeMeal, setIncludeFreeMeal] = useState(false);
  const [freeMealCalories, setFreeMealCalories] = useState(
    userData.dailyCalories ? Math.round(userData.dailyCalories * 0.2) : 500
  );

  // Expanded food data with detailed options
  const foodCategories: FoodCategory[] = [
    {
      name: "Meats & Poultry",
      items: [
        { id: "chicken_breast", name: "Chicken Breast (skinless)", protein: 31, carbs: 0, fats: 3.6, caloriesPerServing: 165, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "chicken_thigh_skinless", name: "Chicken Thigh (skinless)", protein: 26, carbs: 0, fats: 10, caloriesPerServing: 209, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "chicken_thigh_skin", name: "Chicken Thigh (with skin)", protein: 24, carbs: 0, fats: 15.5, caloriesPerServing: 229, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "chicken_wings", name: "Chicken Wings", protein: 30, carbs: 0, fats: 19, caloriesPerServing: 290, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "ground_turkey", name: "Ground Turkey (93% lean)", protein: 27, carbs: 0, fats: 8, caloriesPerServing: 170, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "beef_steak", name: "Beef Steak (sirloin)", protein: 26, carbs: 0, fats: 15, caloriesPerServing: 244, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "ground_beef_lean", name: "Ground Beef (90% lean)", protein: 26, carbs: 0, fats: 10, caloriesPerServing: 196, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "ground_beef_reg", name: "Ground Beef (80% lean)", protein: 25, carbs: 0, fats: 18, caloriesPerServing: 254, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "pork_chop", name: "Pork Chop (lean)", protein: 25, carbs: 0, fats: 7, caloriesPerServing: 175, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "bacon", name: "Bacon", protein: 37, carbs: 1, fats: 42, caloriesPerServing: 541, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "lamb", name: "Lamb (lean)", protein: 25, carbs: 0, fats: 16, caloriesPerServing: 258, servingSize: "100g cooked", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Fish & Seafood",
      items: [
        { id: "salmon", name: "Salmon (Atlantic)", protein: 25, carbs: 0, fats: 13, caloriesPerServing: 208, servingSize: "100g fillet", servingSizeGrams: 100 },
        { id: "salmon_smoked", name: "Smoked Salmon", protein: 24, carbs: 0, fats: 11, caloriesPerServing: 190, servingSize: "100g", servingSizeGrams: 100 },
        { id: "tuna", name: "Tuna (fresh)", protein: 30, carbs: 0, fats: 1, caloriesPerServing: 130, servingSize: "100g", servingSizeGrams: 100 },
        { id: "tuna_canned", name: "Tuna (canned in water)", protein: 26, carbs: 0, fats: 1, caloriesPerServing: 116, servingSize: "100g drained", servingSizeGrams: 100 },
        { id: "cod", name: "Cod", protein: 23, carbs: 0, fats: 1, caloriesPerServing: 105, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "tilapia", name: "Tilapia", protein: 26, carbs: 0, fats: 3, caloriesPerServing: 128, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "sardines", name: "Sardines (canned)", protein: 25, carbs: 0, fats: 11, caloriesPerServing: 208, servingSize: "100g drained", servingSizeGrams: 100 },
        { id: "shrimp", name: "Shrimp", protein: 24, carbs: 0, fats: 1, caloriesPerServing: 99, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "crab", name: "Crab", protein: 19, carbs: 0, fats: 1, caloriesPerServing: 97, servingSize: "100g cooked", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Eggs & Dairy",
      items: [
        { id: "eggs_whole", name: "Eggs (whole)", protein: 13, carbs: 1, fats: 11, caloriesPerServing: 155, servingSize: "2 large eggs", servingSizeGrams: 100 },
        { id: "egg_whites", name: "Egg Whites", protein: 11, carbs: 1, fats: 0, caloriesPerServing: 52, servingSize: "100g (3 whites)", servingSizeGrams: 100 },
        { id: "greek_yogurt", name: "Greek Yogurt (plain, nonfat)", protein: 17, carbs: 6, fats: 0.7, caloriesPerServing: 100, servingSize: "170g container", servingSizeGrams: 170 },
        { id: "greek_yogurt_full", name: "Greek Yogurt (plain, full-fat)", protein: 15, carbs: 6, fats: 8, caloriesPerServing: 150, servingSize: "170g container", servingSizeGrams: 170 },
        { id: "cottage_cheese", name: "Cottage Cheese (2% fat)", protein: 25, carbs: 6, fats: 10, caloriesPerServing: 206, servingSize: "226g cup", servingSizeGrams: 226 },
        { id: "mozzarella", name: "Mozzarella Cheese", protein: 28, carbs: 3, fats: 22, caloriesPerServing: 318, servingSize: "100g", servingSizeGrams: 100 },
        { id: "cheddar", name: "Cheddar Cheese", protein: 25, carbs: 1, fats: 33, caloriesPerServing: 402, servingSize: "100g", servingSizeGrams: 100 },
        { id: "parmesan", name: "Parmesan Cheese", protein: 35, carbs: 4, fats: 28, caloriesPerServing: 420, servingSize: "100g", servingSizeGrams: 100 },
        { id: "milk", name: "Milk (2%)", protein: 8, carbs: 12, fats: 5, caloriesPerServing: 124, servingSize: "240ml cup", servingSizeGrams: 244 },
      ],
    },
    {
      name: "Plant Proteins",
      items: [
        { id: "tofu_firm", name: "Tofu (firm)", protein: 8, carbs: 2, fats: 4, caloriesPerServing: 76, servingSize: "100g", servingSizeGrams: 100 },
        { id: "tofu_extra_firm", name: "Tofu (extra firm)", protein: 10, carbs: 2, fats: 5, caloriesPerServing: 86, servingSize: "100g", servingSizeGrams: 100 },
        { id: "tempeh", name: "Tempeh", protein: 19, carbs: 9, fats: 11, caloriesPerServing: 196, servingSize: "100g", servingSizeGrams: 100 },
        { id: "seitan", name: "Seitan", protein: 25, carbs: 4, fats: 1, caloriesPerServing: 130, servingSize: "100g", servingSizeGrams: 100 },
        { id: "black_beans", name: "Black Beans", protein: 8, carbs: 23, fats: 0.5, caloriesPerServing: 127, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "chickpeas", name: "Chickpeas", protein: 9, carbs: 27, fats: 2.5, caloriesPerServing: 164, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "lentils", name: "Lentils", protein: 18, carbs: 40, fats: 1, caloriesPerServing: 230, servingSize: "198g cooked cup", servingSizeGrams: 198 },
        { id: "edamame", name: "Edamame", protein: 11, carbs: 10, fats: 5, caloriesPerServing: 122, servingSize: "100g", servingSizeGrams: 100 },
        { id: "protein_powder", name: "Protein Powder (whey)", protein: 24, carbs: 3, fats: 1, caloriesPerServing: 120, servingSize: "30g scoop", servingSizeGrams: 30 },
        { id: "protein_powder_plant", name: "Protein Powder (plant-based)", protein: 21, carbs: 5, fats: 2, caloriesPerServing: 120, servingSize: "30g scoop", servingSizeGrams: 30 },
      ],
    },
    {
      name: "Grains & Pastas",
      items: [
        { id: "white_rice", name: "White Rice", protein: 4, carbs: 45, fats: 0.4, caloriesPerServing: 200, servingSize: "158g cooked cup", servingSizeGrams: 158 },
        { id: "brown_rice", name: "Brown Rice", protein: 5, carbs: 46, fats: 1.8, caloriesPerServing: 216, servingSize: "195g cooked cup", servingSizeGrams: 195 },
        { id: "jasmine_rice", name: "Jasmine Rice", protein: 4, carbs: 45, fats: 0.4, caloriesPerServing: 205, servingSize: "158g cooked cup", servingSizeGrams: 158 },
        { id: "basmati_rice", name: "Basmati Rice", protein: 5, carbs: 45, fats: 0.5, caloriesPerServing: 205, servingSize: "158g cooked cup", servingSizeGrams: 158 },
        { id: "quinoa", name: "Quinoa", protein: 8, carbs: 39, fats: 4, caloriesPerServing: 222, servingSize: "185g cooked cup", servingSizeGrams: 185 },
        { id: "couscous", name: "Couscous", protein: 6, carbs: 36, fats: 0.3, caloriesPerServing: 176, servingSize: "157g cooked cup", servingSizeGrams: 157 },
        { id: "pasta_regular", name: "Pasta (white)", protein: 7, carbs: 43, fats: 1, caloriesPerServing: 200, servingSize: "140g cooked cup", servingSizeGrams: 140 },
        { id: "pasta_whole_wheat", name: "Pasta (whole wheat)", protein: 8, carbs: 37, fats: 1, caloriesPerServing: 174, servingSize: "140g cooked cup", servingSizeGrams: 140 },
        { id: "pasta_chickpea", name: "Pasta (chickpea)", protein: 14, carbs: 32, fats: 2, caloriesPerServing: 190, servingSize: "140g cooked cup", servingSizeGrams: 140 },
        { id: "pasta_lentil", name: "Pasta (red lentil)", protein: 13, carbs: 31, fats: 1, caloriesPerServing: 180, servingSize: "140g cooked cup", servingSizeGrams: 140 },
      ],
    },
    {
      name: "Starchy Vegetables",
      items: [
        { id: "sweet_potato", name: "Sweet Potato", protein: 2, carbs: 26, fats: 0.1, caloriesPerServing: 112, servingSize: "130g medium", servingSizeGrams: 130 },
        { id: "potatoes", name: "Potatoes (white)", protein: 2, carbs: 17, fats: 0.1, caloriesPerServing: 77, servingSize: "100g boiled", servingSizeGrams: 100 },
        { id: "potatoes_sweet", name: "Sweet Potatoes", protein: 2, carbs: 20, fats: 0.1, caloriesPerServing: 90, servingSize: "100g baked", servingSizeGrams: 100 },
        { id: "corn", name: "Corn", protein: 3.3, carbs: 25, fats: 1.4, caloriesPerServing: 125, servingSize: "100g", servingSizeGrams: 100 },
        { id: "peas", name: "Green Peas", protein: 5, carbs: 14, fats: 0.4, caloriesPerServing: 81, servingSize: "100g", servingSizeGrams: 100 },
        { id: "butternut_squash", name: "Butternut Squash", protein: 1, carbs: 12, fats: 0.1, caloriesPerServing: 45, servingSize: "100g", servingSizeGrams: 100 },
        { id: "acorn_squash", name: "Acorn Squash", protein: 1, carbs: 15, fats: 0.1, caloriesPerServing: 56, servingSize: "100g", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Breads & Breakfast",
      items: [
        { id: "whole_wheat_bread", name: "Whole Wheat Bread", protein: 4, carbs: 13, fats: 1, caloriesPerServing: 69, servingSize: "28g slice", servingSizeGrams: 28 },
        { id: "white_bread", name: "White Bread", protein: 3, carbs: 14, fats: 1, caloriesPerServing: 77, servingSize: "28g slice", servingSizeGrams: 28 },
        { id: "ezekiel_bread", name: "Ezekiel Bread", protein: 4, carbs: 15, fats: 0.5, caloriesPerServing: 80, servingSize: "34g slice", servingSizeGrams: 34 },
        { id: "bagel", name: "Bagel", protein: 10, carbs: 53, fats: 1, caloriesPerServing: 270, servingSize: "105g bagel", servingSizeGrams: 105 },
        { id: "english_muffin", name: "English Muffin", protein: 4, carbs: 25, fats: 1, caloriesPerServing: 130, servingSize: "57g muffin", servingSizeGrams: 57 },
        { id: "tortilla_corn", name: "Corn Tortilla", protein: 1, carbs: 11, fats: 0.5, caloriesPerServing: 52, servingSize: "30g (6 inch)", servingSizeGrams: 30 },
        { id: "tortilla_flour", name: "Flour Tortilla", protein: 3, carbs: 15, fats: 3, caloriesPerServing: 100, servingSize: "30g (6 inch)", servingSizeGrams: 30 },
        { id: "oats", name: "Oats (rolled)", protein: 13, carbs: 67, fats: 7, caloriesPerServing: 389, servingSize: "100g dry", servingSizeGrams: 100 },
        { id: "oats_steel", name: "Oats (steel cut)", protein: 13, carbs: 67, fats: 7, caloriesPerServing: 379, servingSize: "100g dry", servingSizeGrams: 100 },
        { id: "cereal", name: "Cereal (low sugar)", protein: 7, carbs: 74, fats: 2, caloriesPerServing: 380, servingSize: "100g", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Green Vegetables",
      items: [
        { id: "broccoli", name: "Broccoli", protein: 2.6, carbs: 6, fats: 0.3, caloriesPerServing: 34, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "spinach", name: "Spinach", protein: 2.9, carbs: 3.6, fats: 0.4, caloriesPerServing: 23, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "kale", name: "Kale", protein: 2.9, carbs: 6.7, fats: 0.5, caloriesPerServing: 35, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "bok_choy", name: "Bok Choy", protein: 1.5, carbs: 2.2, fats: 0.2, caloriesPerServing: 13, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "collard_greens", name: "Collard Greens", protein: 2, carbs: 5.7, fats: 0.5, caloriesPerServing: 32, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "brussels_sprouts", name: "Brussels Sprouts", protein: 3.4, carbs: 9, fats: 0.3, caloriesPerServing: 43, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "asparagus", name: "Asparagus", protein: 2.2, carbs: 3.9, fats: 0.1, caloriesPerServing: 20, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "green_beans", name: "Green Beans", protein: 1.8, carbs: 7, fats: 0.1, caloriesPerServing: 31, servingSize: "100g raw", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Other Vegetables",
      items: [
        { id: "bell_peppers", name: "Bell Peppers", protein: 1, carbs: 6, fats: 0.3, caloriesPerServing: 30, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "cucumber", name: "Cucumber", protein: 0.7, carbs: 3.6, fats: 0.1, caloriesPerServing: 16, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "carrots", name: "Carrots", protein: 0.9, carbs: 10, fats: 0.2, caloriesPerServing: 41, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "zucchini", name: "Zucchini", protein: 1.2, carbs: 3.9, fats: 0.3, caloriesPerServing: 20, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "tomatoes", name: "Tomatoes", protein: 0.9, carbs: 3.9, fats: 0.2, caloriesPerServing: 18, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "mushrooms", name: "Mushrooms", protein: 3, carbs: 3, fats: 0.3, caloriesPerServing: 22, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "onions", name: "Onions", protein: 1.1, carbs: 9.3, fats: 0.1, caloriesPerServing: 40, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "cauliflower", name: "Cauliflower", protein: 1.9, carbs: 5, fats: 0.3, caloriesPerServing: 25, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "eggplant", name: "Eggplant", protein: 1, carbs: 6, fats: 0.2, caloriesPerServing: 25, servingSize: "100g raw", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Fruits",
      items: [
        { id: "banana", name: "Banana", protein: 1.1, carbs: 23, fats: 0.3, caloriesPerServing: 96, servingSize: "118g medium", servingSizeGrams: 118 },
        { id: "apple", name: "Apple", protein: 0.3, carbs: 14, fats: 0.2, caloriesPerServing: 59, servingSize: "100g medium", servingSizeGrams: 100 },
        { id: "berries_mixed", name: "Mixed Berries", protein: 0.7, carbs: 14, fats: 0.3, caloriesPerServing: 57, servingSize: "100g", servingSizeGrams: 100 },
        { id: "strawberries", name: "Strawberries", protein: 0.7, carbs: 7.7, fats: 0.3, caloriesPerServing: 32, servingSize: "100g", servingSizeGrams: 100 },
        { id: "blueberries", name: "Blueberries", protein: 0.7, carbs: 14, fats: 0.3, caloriesPerServing: 57, servingSize: "100g", servingSizeGrams: 100 },
        { id: "blackberries", name: "Blackberries", protein: 1.4, carbs: 10, fats: 0.4, caloriesPerServing: 43, servingSize: "100g", servingSizeGrams: 100 },
        { id: "raspberries", name: "Raspberries", protein: 1.2, carbs: 12, fats: 0.7, caloriesPerServing: 52, servingSize: "100g", servingSizeGrams: 100 },
        { id: "orange", name: "Orange", protein: 1.2, carbs: 12, fats: 0.2, caloriesPerServing: 62, servingSize: "131g medium", servingSizeGrams: 131 },
        { id: "avocado", name: "Avocado", protein: 2, carbs: 12, fats: 15, caloriesPerServing: 160, servingSize: "100g (1/2 medium)", servingSizeGrams: 100 },
        { id: "mango", name: "Mango", protein: 0.8, carbs: 15, fats: 0.3, caloriesPerServing: 60, servingSize: "100g", servingSizeGrams: 100 },
        { id: "pineapple", name: "Pineapple", protein: 0.5, carbs: 13, fats: 0.1, caloriesPerServing: 50, servingSize: "100g", servingSizeGrams: 100 },
        { id: "grapes", name: "Grapes", protein: 0.6, carbs: 17, fats: 0.3, caloriesPerServing: 69, servingSize: "100g", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Healthy Fats",
      items: [
        { id: "olive_oil", name: "Olive Oil", protein: 0, carbs: 0, fats: 14, caloriesPerServing: 119, servingSize: "1 tbsp (14g)", servingSizeGrams: 14 },
        { id: "coconut_oil", name: "Coconut Oil", protein: 0, carbs: 0, fats: 14, caloriesPerServing: 121, servingSize: "1 tbsp (14g)", servingSizeGrams: 14 },
        { id: "avocado_oil", name: "Avocado Oil", protein: 0, carbs: 0, fats: 14, caloriesPerServing: 124, servingSize: "1 tbsp (14g)", servingSizeGrams: 14 },
        { id: "butter", name: "Butter", protein: 0.1, carbs: 0.1, fats: 11.5, caloriesPerServing: 102, servingSize: "1 tbsp (14g)", servingSizeGrams: 14 },
        { id: "almonds", name: "Almonds", protein: 6, carbs: 6, fats: 14, caloriesPerServing: 164, servingSize: "28g (1/4 cup)", servingSizeGrams: 28 },
        { id: "walnuts", name: "Walnuts", protein: 4, carbs: 4, fats: 18, caloriesPerServing: 185, servingSize: "30g (1/4 cup)", servingSizeGrams: 30 },
        { id: "chia_seeds", name: "Chia Seeds", protein: 5, carbs: 12, fats: 9, caloriesPerServing: 137, servingSize: "28g (2 tbsp)", servingSizeGrams: 28 },
        { id: "flax_seeds", name: "Flax Seeds", protein: 5, carbs: 8, fats: 10, caloriesPerServing: 150, servingSize: "30g (2 tbsp)", servingSizeGrams: 30 },
        { id: "peanut_butter", name: "Peanut Butter", protein: 4, carbs: 3, fats: 8, caloriesPerServing: 94, servingSize: "16g (1 tbsp)", servingSizeGrams: 16 },
        { id: "almond_butter", name: "Almond Butter", protein: 3.5, carbs: 3, fats: 9, caloriesPerServing: 98, servingSize: "16g (1 tbsp)", servingSizeGrams: 16 },
      ],
    },
  ];

  // Initialize selectedFoods with all foods set to true by default
  const initializeSelectedFoods = () => {
    const foods: Record<string, boolean> = {};
    foodCategories.forEach(category => {
      category.items.forEach(food => {
        foods[food.id] = true; // Default to true for all foods
      });
    });
    return foods;
  };

  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>(initializeSelectedFoods());

  useEffect(() => {
    if (!userData.dailyCalories || !userData.macros.protein) {
      toast({
        title: "Missing information",
        description: "Please complete your goals and nutrition plan first",
        variant: "destructive",
      });
      navigate("/plan");
    }
  }, [userData.dailyCalories, userData.macros.protein, navigate, toast]);

  // Generate a meal plan based on selected foods and user's macros
  const generateMealPlan = () => {
    const selectedFoodCount = Object.values(selectedFoods).filter(value => value).length;
    
    if (selectedFoodCount < 10) {
      toast({
        title: "Not enough foods selected",
        description: "Please select at least 10 different foods to create a varied meal plan",
        variant: "destructive",
      });
      return;
    }

    // Get user's daily targets
    const dailyCalories = userData.dailyCalories || 2000;
    const targetProtein = userData.macros.protein || 150;
    const targetCarbs = userData.macros.carbs || 200;
    const targetFats = userData.macros.fats || 67;

    // Adjust macros if free meal is included
    let availableCalories = dailyCalories;
    let availableProtein = targetProtein;
    let availableCarbs = targetCarbs;
    let availableFats = targetFats;

    if (includeFreeMeal) {
      // Limit free meal to at most 20% of daily calories
      const freeMealCals = Math.min(freeMealCalories, dailyCalories * 0.2);
      availableCalories -= freeMealCals;
      
      // Roughly distribute the macros for the free meal (assuming 20% protein, 50% carbs, 30% fat)
      availableProtein -= Math.round((freeMealCals * 0.2) / 4); // Protein has 4 calories per gram
      availableCarbs -= Math.round((freeMealCals * 0.5) / 4);   // Carbs have 4 calories per gram
      availableFats -= Math.round((freeMealCals * 0.3) / 9);    // Fats have 9 calories per gram
    }

    // Create a pool of available foods
    const selectedFoodItems = foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);

    // Distribute into 3 or 4 meals based on calorie amount
    const numberOfMeals = availableCalories > 1800 ? 4 : 3;
    
    // Calculate macros per meal (distribute evenly)
    const caloriesPerMeal = Math.floor(availableCalories / numberOfMeals);
    const proteinPerMeal = Math.floor(availableProtein / numberOfMeals);
    const carbsPerMeal = Math.floor(availableCarbs / numberOfMeals);
    const fatsPerMeal = Math.floor(availableFats / numberOfMeals);

    const mealNames = ["Breakfast", "Lunch", "Dinner", "Snack"];
    
    // Create balanced meals using our utility function
    const meals: Meal[] = [];
    for (let i = 0; i < numberOfMeals; i++) {
      const meal = createBalancedMeal(
        selectedFoodItems,
        caloriesPerMeal,
        proteinPerMeal,
        carbsPerMeal,
        fatsPerMeal,
        mealNames[i]
      );
      meals.push(meal);
    }

    // If free meal is included, add it
    if (includeFreeMeal) {
      const freeMealCals = Math.min(freeMealCalories, dailyCalories * 0.2);
      meals.push({
        id: "free-meal",
        name: "Free Meal",
        foods: [{
          id: "free-choice",
          name: "Your choice",
          servings: 1,
          servingSizeGrams: 0,
          servingSize: "Your choice",
          protein: Math.round((freeMealCals * 0.2) / 4),
          carbs: Math.round((freeMealCals * 0.5) / 4),
          fats: Math.round((freeMealCals * 0.3) / 9),
          calories: freeMealCals
        }],
        totalProtein: Math.round((freeMealCals * 0.2) / 4),
        totalCarbs: Math.round((freeMealCals * 0.5) / 4),
        totalFats: Math.round((freeMealCals * 0.3) / 9),
        totalCalories: freeMealCals
      });
    }

    setMealPlan(meals);
    setActiveTab("plan");
    
    toast({
      title: "Meal plan generated!",
      description: "Your personalized meal plan is ready.",
    });
  };

  // Regenerate a specific meal
  const regenerateMeal = (mealId: string) => {
    if (mealId === "free-meal") return; // Don't regenerate free meals
    
    // Find the meal to regenerate
    const mealIndex = mealPlan.findIndex(meal => meal.id === mealId);
    if (mealIndex === -1) return;
    
    // Get user's daily targets
    const dailyCalories = userData.dailyCalories || 2000;
    const targetProtein = userData.macros.protein || 150;
    const targetCarbs = userData.macros.carbs || 200;
    const targetFats = userData.macros.fats || 67;
    
    // Calculate number of meals (excluding free meal)
    const regularMeals = includeFreeMeal ? mealPlan.length - 1 : mealPlan.length;
    
    // Calculate per-meal targets
    const caloriesPerMeal = Math.floor(dailyCalories / regularMeals);
    const proteinPerMeal = Math.floor(targetProtein / regularMeals);
    const carbsPerMeal = Math.floor(targetCarbs / regularMeals);
    const fatsPerMeal = Math.floor(targetFats / regularMeals);
    
    // Create a pool of available foods
    const selectedFoodItems = foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);
    
    // Generate new meal
    const newMeal = createBalancedMeal(
      selectedFoodItems,
      caloriesPerMeal,
      proteinPerMeal,
      carbsPerMeal,
      fatsPerMeal,
      mealPlan[mealIndex].name
    );
    
    // Update the meal plan
    const updatedMealPlan = [...mealPlan];
    updatedMealPlan[mealIndex] = newMeal;
    setMealPlan(updatedMealPlan);
    
    toast({
      title: "Meal regenerated",
      description: "Your meal has been refreshed with new options.",
    });
  };

  if (!userData.dailyCalories || !userData.macros.protein) {
    return <EmptyStateMessage />;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gradient-purple">
            Your Diet Plan
          </h1>
          
          <Tabs 
            defaultValue="preferences" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="preferences">Food Preferences</TabsTrigger>
              <TabsTrigger value="plan">Meal Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences" className="space-y-6">
              <FoodPreferences 
                foodCategories={foodCategories}
                selectedFoods={selectedFoods}
                setSelectedFoods={setSelectedFoods}
                includeFreeMeal={includeFreeMeal}
                setIncludeFreeMeal={setIncludeFreeMeal}
                generateMealPlan={generateMealPlan}
                dailyCalories={userData.dailyCalories || 2000}
              />
            </TabsContent>
            
            <TabsContent value="plan" className="space-y-4">
              <MealPlanDisplay 
                mealPlan={mealPlan}
                generateMealPlan={generateMealPlan}
                regenerateMeal={regenerateMeal}
                setActiveTab={setActiveTab}
                calorieTarget={userData.dailyCalories || 2000}
                userMacros={userData.macros}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DietPage;
