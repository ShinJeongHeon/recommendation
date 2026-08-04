import { useMemo, useState } from 'react';
import { loadCatalog } from './data/loader';
import { answerInventoryQuestion, completeCooking } from './domain/complete';
import { markVideoOpened, type TodayDeps } from './domain/engine/today';
import type { ConfirmCandidate } from './domain/inventory/index';
import { buildPriceBlockData } from './domain/savings/index';
import { browserBackend, createStorage } from './storage/local';
import { CookComplete } from './ui/screens/CookComplete';
import { Home } from './ui/screens/Home';
import { Onboarding } from './ui/screens/Onboarding';
import { RecipeDetail } from './ui/screens/RecipeDetail';
import { Savings } from './ui/screens/Savings';

type Screen =
  | { name: 'home' }
  | { name: 'recipe'; recipeId: string }
  | { name: 'complete'; recipeId: string; questions: ConfirmCandidate[] }
  | { name: 'savings' };

export function App() {
  const catalog = useMemo(() => loadCatalog('dev'), []);
  const storage = useMemo(() => createStorage(browserBackend()), []);
  const deps: TodayDeps = useMemo(
    () => ({ recipes: catalog.recipes, ingredients: catalog.ingredients, storage, clock: () => new Date() }),
    [catalog, storage],
  );

  const [onboarded, setOnboarded] = useState(() => storage.loadProfile() !== null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  if (!onboarded) {
    return (
      <Onboarding
        storage={storage}
        ingredients={[...catalog.ingredients.values()]}
        clock={deps.clock}
        onDone={() => setOnboarded(true)}
      />
    );
  }

  if (screen.name === 'recipe') {
    const recipe = catalog.recipes.find((r) => r.id === screen.recipeId);
    if (recipe) {
      const price = buildPriceBlockData(recipe, storage.loadInventory(), catalog.prices);
      return (
        <RecipeDetail
          recipe={recipe}
          onBack={() => setScreen({ name: 'home' })}
          onVideoOpen={() => markVideoOpened(deps)}
          onComplete={() => {
            const result = completeCooking(deps, recipe.id);
            setScreen({ name: 'complete', recipeId: recipe.id, questions: result.questions });
          }}
          priceBlock={
            <section style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                이번 장보기 {price.shoppingTotal.toLocaleString()}원 → 이걸로 {price.mealsCount}끼
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#555' }}>
                끼당 약 {price.perMeal.toLocaleString()}원
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#999' }}>{price.notice}</p>
            </section>
          }
        />
      );
    }
  }

  if (screen.name === 'savings') {
    return (
      <Savings
        ledger={storage.loadSavings()}
        recipes={catalog.recipes}
        now={new Date()}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'complete') {
    const recipe = catalog.recipes.find((r) => r.id === screen.recipeId);
    return (
      <CookComplete
        recipeName={recipe?.name ?? ''}
        questions={screen.questions}
        onAnswer={(ingredientId, stillHave) => answerInventoryQuestion(deps, ingredientId, stillHave)}
        onDone={() => setScreen({ name: 'home' })}
        onShowSavings={() => setScreen({ name: 'savings' })}
      />
    );
  }

  return <Home deps={deps} onOpenRecipe={(recipeId) => setScreen({ name: 'recipe', recipeId })} />;
}
