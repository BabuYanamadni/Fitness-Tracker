// src/pages/Nutrition.js
import React, { useEffect, useState } from 'react';
import { nutritionAPI } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function Nutrition() {
  const [summary,  setSummary]  = useState(null);
  const [meals,    setMeals]    = useState([]);
  const [goal,     setGoal]     = useState(null);
  const [water,    setWater]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [showLog,  setShowLog]  = useState(false);
  const [foods,    setFoods]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [logForm,  setLogForm]  = useState({ meal_type: 'breakfast', food_item: '', quantity: 1 });

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, mealRes, goalRes, waterRes] = await Promise.all([
        nutritionAPI.getDailySummary(today),
        nutritionAPI.getTodayMeals(),
        nutritionAPI.getMyGoal(),
        nutritionAPI.getTodayWater(),
      ]);
      setSummary(sumRes.data);
      setMeals(mealRes.data);
      setGoal(goalRes.data);
      setWater(waterRes.data.total_ml || 0);
    } catch (e) {
      toast.error('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const searchFoods = async (q) => {
    if (!q.trim()) return;
    try {
      const { data } = await nutritionAPI.searchFoods(q);
      setFoods(data.results || data);
    } catch { toast.error('Food search failed'); }
  };

  const logWater = async (ml) => {
    try {
      await nutritionAPI.logWater({ amount_ml: ml, logged_date: today });
      setWater(w => w + ml);
      toast.success(`+${ml}ml water logged! 💧`);
    } catch { toast.error('Failed to log water'); }
  };

  const logMeal = async (e) => {
    e.preventDefault();
    try {
      // Find or create meal of this type today
      let meal = meals.find(m => m.meal_type === logForm.meal_type);
      if (!meal) {
        const { data } = await nutritionAPI.createMeal({ meal_type: logForm.meal_type, logged_date: today });
        meal = data;
      }
      await nutritionAPI.addMealItem({ meal: meal.id, food_item: parseInt(logForm.food_item), quantity: logForm.quantity });
      toast.success('Meal item logged!');
      setShowLog(false);
      load();
    } catch { toast.error('Failed to log meal item'); }
  };

  const macroBar = (val, goal_val, color) => {
    const pct = goal_val ? Math.min((val / goal_val) * 100, 100) : 0;
    return (
      <div style={{ background: 'var(--clr-surface2)', borderRadius: '50px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '50px', transition: 'width 0.6s ease' }} />
      </div>
    );
  };

  if (loading) return <Loader text="Loading nutrition data…" />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Nutrition <span style={{ color: 'var(--clr-primary)' }}>🥗</span></h1>
          <p style={{ color: 'var(--clr-muted)' }}>Track your daily food and water intake</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLog(true)}>+ Log Food</button>
      </div>

      {/* Macro summary */}
      {summary && goal && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h2 className="section-title">Today's Macros</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { label: 'Calories', val: summary.total_calories, goal: goal.daily_calories, color: 'var(--clr-accent2)', unit: 'kcal' },
                { label: 'Protein',  val: summary.total_protein,  goal: goal.protein_g,      color: 'var(--clr-primary)', unit: 'g' },
                { label: 'Carbs',    val: summary.total_carbs,    goal: goal.carbs_g,        color: 'var(--clr-accent)',  unit: 'g' },
                { label: 'Fat',      val: summary.total_fat,      goal: goal.fat_g,          color: 'var(--clr-warning)', unit: 'g' },
              ].map(({ label, val, goal: g, color, unit }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color }}>
                      {Math.round(val)}<span style={{ color: 'var(--clr-muted)', fontWeight: 400 }}>/{g}{unit}</span>
                    </span>
                  </div>
                  {macroBar(val, g, color)}
                </div>
              ))}
            </div>
          </div>

          {/* Water tracker */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Water 💧</h2>
            <div style={{
              fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800,
              color: 'var(--clr-accent)',
            }}>{(water / 1000).toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--clr-muted)' }}>/{(goal.water_ml / 1000).toFixed(1)}L</span></div>
            {macroBar(water, goal.water_ml, 'var(--clr-accent)')}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[150, 250, 500].map(ml => (
                <button key={ml} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => logWater(ml)}>
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meal log */}
      <div className="card">
        <h2 className="section-title">Today's Meals</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {MEAL_TYPES.map(type => {
            const meal = meals.find(m => m.meal_type === type);
            return (
              <div key={type} style={{
                padding: '1rem', background: 'var(--clr-surface2)',
                borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{MEAL_ICONS[type]}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'capitalize' }}>{type}</span>
                  </div>
                  {meal && (
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--clr-accent2)', fontSize: '0.9rem' }}>
                      {Math.round(meal.total_calories)} kcal
                    </span>
                  )}
                </div>
                {meal?.items?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {meal.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
                        <span>{item.food_name} ×{item.quantity}</span>
                        <span>{Math.round(item.calories)} kcal</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>Nothing logged yet</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log food modal */}
      {showLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.25rem' }}>Log Food</h2>
            <form onSubmit={logMeal}>
              <div className="form-group">
                <label>Meal Type</label>
                <select className="input-field" value={logForm.meal_type} onChange={e => setLogForm(f => ({ ...f, meal_type: e.target.value }))}>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Search Food</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" placeholder="Search food items…" value={search}
                    onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-outline" onClick={() => searchFoods(search)}>Search</button>
                </div>
              </div>
              {foods.length > 0 && (
                <div className="form-group">
                  <label>Select Food</label>
                  <select className="input-field" value={logForm.food_item} onChange={e => setLogForm(f => ({ ...f, food_item: e.target.value }))} required>
                    <option value="">-- choose --</option>
                    {foods.map(f => <option key={f.id} value={f.id}>{f.name} ({f.calories}kcal/serving)</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Servings</label>
                <input className="input-field" type="number" min="0.25" step="0.25" value={logForm.quantity}
                  onChange={e => setLogForm(f => ({ ...f, quantity: parseFloat(e.target.value) }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Log</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowLog(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
