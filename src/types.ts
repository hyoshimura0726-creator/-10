export type Category = '主菜' | '副菜' | '汁物' | '主食' | 'スイーツ' | 'その他';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

export interface Step {
  id: string;
  description: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  category: Category;
  tags?: string[];
  ingredients: Ingredient[];
  steps: Step[];
  tips: string;
  isTipsPublic: boolean;
  nutrition?: Nutrition;
  createdAt: number;
  ownerId?: string;
}
