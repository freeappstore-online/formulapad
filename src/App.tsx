import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initApp } from '@freeappstore/sdk';
import {
  FasShell,
} from '@freeappstore/sdk/ui';
import {
  Zap,
  Compass,
  FlaskConical,
  RotateCcw,
  ArrowLeft,
  Search,
  Sliders,
  Calculator,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FORMULA_REGISTRY } from './formulas';
import { FormulaItem, ParamDef, SubjectType } from './types';

// Initialize FreeAppStore SDK
const fas = initApp({ appId: 'formula-pad' });

/**
 * Responsive Visual Simulation Canvas with Ultra-Wide Mobile Zoom Support (10% - 300%)
 * Allows ultra-deep zoom out to 0.10 (10%) without artificial clamping, maintaining centered alignment and fluid touch stability.
 */
interface VisualCanvasProps {
  children: React.ReactNode;
  title?: string;
}

function VisualCanvas({ children, title }: VisualCanvasProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1.0);
  const lastTapRef = useRef<number>(0);

  // Minimum & Maximum scale thresholds allowing ultra-deep zoom-out
  const MIN_ZOOM = 0.10; // 10% ultra-deep zoom-out
  const MAX_ZOOM = 3.00; // 300% zoom-in

  // Attach native non-passive touch listeners for multi-touch pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        initialPinchDistRef.current = getDistance(e.touches[0], e.touches[1]);
        initialZoomRef.current = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
        e.preventDefault(); // Prevent conflicting browser page zoom while pinching canvas
        const currentDist = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDist / initialPinchDistRef.current;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoomRef.current * scaleFactor));
        setZoom(parseFloat(newZoom.toFixed(2)));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        initialPinchDistRef.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        setZoom((prev) => {
          const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
          return parseFloat(next.toFixed(2));
        });
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => parseFloat(Math.min(MAX_ZOOM, prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => parseFloat(Math.max(MIN_ZOOM, prev - 0.15).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Double tap to toggle 100% <-> 50%
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setZoom((prev) => (prev !== 1.0 ? 1.0 : 0.50));
    }
    lastTapRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
      className="relative w-full max-w-full box-border rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm transition-all select-none overflow-x-auto overflow-y-auto"
    >
      {/* Canvas Top Header & Zoom Controls */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xs text-xs text-zinc-400 font-mono">
        <span className="truncate font-semibold text-zinc-200">{title || 'Live Simulation Canvas'}</span>
        
        {/* Ultra-Wide Zoom Controls Toolbar (10% - 300%) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors cursor-pointer touch-manipulation"
            title="Zoom Out (Down to 10%)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-[11px] font-mono font-bold text-emerald-400 border border-zinc-700 transition-colors cursor-pointer touch-manipulation"
            title="Click to reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors cursor-pointer touch-manipulation"
            title="Zoom In (Up to 300%)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Content with Centered Scale & Bounds */}
      <div 
        onClick={handleDoubleTap}
        className="p-2 sm:p-5 flex items-center justify-center min-h-[170px] sm:min-h-[220px] max-h-48 sm:max-h-none overflow-x-auto overflow-y-auto w-full max-w-full box-border"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <div 
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: isPinching ? 'none' : 'transform 0.15s ease-out',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className="max-w-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Hybrid Parameter Slider & Input with Auto-Expanding Max
 * Clean UI without min/max labels beneath slider
 */
interface ParamControlProps {
  param: ParamDef;
  value: number;
  onChange: (val: number) => void;
}

function ParamControl({ param, value, onChange }: ParamControlProps) {
  const [tempText, setTempText] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [customMax, setCustomMax] = useState(param.max);
  const [customMin, setCustomMin] = useState(param.min);

  useEffect(() => {
    if (!isEditing) {
      setTempText(value.toString());
    }
    if (value > customMax) {
      setCustomMax(Math.round(value * 1.3 * 100) / 100);
    }
    if (value < customMin) {
      setCustomMin(Math.round(value * 0.7 * 100) / 100);
    }
  }, [value, isEditing, customMax, customMin]);

  const commitText = () => {
    setIsEditing(false);
    const parsed = parseFloat(tempText);
    if (!isNaN(parsed)) {
      if (parsed > customMax) {
        setCustomMax(Math.round(parsed * 1.3 * 100) / 100);
      }
      if (parsed < customMin) {
        setCustomMin(Math.round(parsed * 0.7 * 100) / 100);
      }
      onChange(parsed);
    } else {
      setTempText(value.toString());
    }
  };

  const effectiveMin = Math.min(param.min, customMin);
  const effectiveMax = Math.max(param.max, customMax);

  return (
    <div className="space-y-1 sm:space-y-1.5 p-2 sm:p-3 rounded-xl bg-[var(--surface-subtle,#f8fafc)] dark:bg-zinc-900 border border-[var(--border,#e2e8f0)] dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between gap-1.5">
        <label className="text-[11px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {param.label} <span className="font-mono text-zinc-500 dark:text-zinc-400">({param.symbol})</span>
        </label>

        {/* Editable Hybrid Badge / Input */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs">
          <input
            type="text"
            value={tempText}
            onChange={(e) => {
              setIsEditing(true);
              setTempText(e.target.value);
            }}
            onFocus={() => setIsEditing(true)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitText();
            }}
            className="w-14 sm:w-20 bg-transparent font-mono font-bold text-right text-[11px] sm:text-sm text-emerald-600 dark:text-emerald-400 outline-none"
          />
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 pl-0.5">{param.unit}</span>
        </div>
      </div>

      {/* Clean Slider */}
      <input
        type="range"
        min={effectiveMin}
        max={effectiveMax}
        step={param.step || (effectiveMax - effectiveMin) / 100}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(val);
          setTempText(val.toString());
        }}
        className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-manipulation my-0.5"
      />

      {/* Quick Presets - Dense Single-Line Wrap */}
      {param.presets && param.presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-[8px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Presets:</span>
          {param.presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(preset.value);
                setTempText(preset.value.toString());
              }}
              className={`text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-md font-medium transition-colors touch-manipulation cursor-pointer ${
                value === preset.value
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated Specialized pH & Ion Concentration Lab Controller
 */
interface PhLabControlProps {
  currentNegLogH: number;
  onChangeNegLogH: (val: number) => void;
}

function PhLabControl({ currentNegLogH, onChangeNegLogH }: PhLabControlProps) {
  const [inputMode, setInputMode] = useState<'H' | 'OH'>('H');
  const [sciInputText, setSciInputText] = useState('');
  const [isTypingSci, setIsTypingSci] = useState(false);

  const pH = Math.max(0, Math.min(14, currentNegLogH));
  const pOH = 14 - pH;
  const activeConc = inputMode === 'H' ? Math.pow(10, -pH) : Math.pow(10, -pOH);

  useEffect(() => {
    if (!isTypingSci) {
      setSciInputText(activeConc.toExponential(2));
    }
  }, [activeConc, isTypingSci, inputMode]);

  const handleSciCommit = () => {
    setIsTypingSci(false);
    const parsed = parseFloat(sciInputText);
    if (!isNaN(parsed) && parsed > 0) {
      const calcNegLog = -Math.log10(parsed);
      const targetPH = inputMode === 'H' ? calcNegLog : 14 - calcNegLog;
      const clampedPH = Math.max(0, Math.min(14, targetPH));
      onChangeNegLogH(clampedPH);
    } else {
      setSciInputText(activeConc.toExponential(2));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    if (inputMode === 'H') {
      onChangeNegLogH(rawVal);
    } else {
      onChangeNegLogH(14 - rawVal);
    }
  };

  const sliderValue = inputMode === 'H' ? pH : pOH;

  const presets = [
    { label: 'Battery Acid', ph: 1.0 },
    { label: 'Gastric Acid', ph: 1.5 },
    { label: 'Black Coffee', ph: 5.0 },
    { label: 'Pure Water', ph: 7.0 },
    { label: 'Soapy Water', ph: 12.0 },
    { label: 'Bleach', ph: 12.5 },
  ];

  return (
    <div className="space-y-1.5 sm:space-y-3 p-2 sm:p-4 rounded-xl bg-[var(--surface-subtle,#f8fafc)] dark:bg-zinc-900 border border-[var(--border,#e2e8f0)] dark:border-zinc-800">
      {/* Dual Input Mode Toggle */}
      <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-[9px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Input Concentration
        </span>
        <div className="flex items-center rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setInputMode('H')}
            className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-all text-[10px] sm:text-xs cursor-pointer ${
              inputMode === 'H'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            [H⁺] Ion
          </button>
          <button
            type="button"
            onClick={() => setInputMode('OH')}
            className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-all text-[10px] sm:text-xs cursor-pointer ${
              inputMode === 'OH'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            [OH⁻] Ion
          </button>
        </div>
      </div>

      {/* Real Concentration Direct Scientific Input Box */}
      <div className="flex items-center justify-between gap-1.5">
        <div>
          <span className="text-[11px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
            {inputMode === 'H' ? 'Hydronium [H⁺]' : 'Hydroxide [OH⁻]'} Molarity
          </span>
          <span className="text-[9px] sm:text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {inputMode === 'H' ? `pH = ${pH.toFixed(2)}` : `pOH = ${pOH.toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs">
          <input
            type="text"
            value={sciInputText}
            onChange={(e) => {
              setIsTypingSci(true);
              setSciInputText(e.target.value);
            }}
            onFocus={() => setIsTypingSci(true)}
            onBlur={handleSciCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSciCommit();
            }}
            className="w-20 sm:w-28 bg-transparent font-mono font-bold text-right text-[11px] sm:text-sm text-emerald-600 dark:text-emerald-400 outline-none"
            placeholder="e.g. 1.0e-7"
          />
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 pl-0.5">M</span>
        </div>
      </div>

      {/* Logarithmic Slider Track (0 to 14) */}
      <div className="space-y-0.5">
        <input
          type="range"
          min={0}
          max={14}
          step={0.05}
          value={sliderValue}
          onChange={handleSliderChange}
          className={`w-full h-1.5 sm:h-2 rounded-lg appearance-none cursor-pointer touch-manipulation ${
            inputMode === 'H' ? 'accent-rose-500' : 'accent-cyan-500'
          } bg-zinc-200 dark:bg-zinc-700`}
        />
        <div className="flex justify-between text-[8px] sm:text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <span>10⁰ M (1 M)</span>
          <span>10⁻⁷ M (Neutral)</span>
          <span>10⁻¹⁴ M</span>
        </div>
      </div>

      {/* Exact Chemical Substances Quick Presets */}
      <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
        <span className="text-[8px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
          Chemical Substance Presets:
        </span>
        <div className="grid grid-cols-3 gap-1">
          {presets.map((preset, idx) => {
            const isSelected = Math.abs(pH - preset.ph) < 0.1;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeNegLogH(preset.ph)}
                className={`p-1 rounded-lg text-left transition-all border text-[9px] sm:text-[11px] cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="font-bold truncate">{preset.label}</div>
                <div className={`text-[8px] sm:text-[9px] font-mono ${isSelected ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  pH {preset.ph.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Global Workspace Zoom Level (40% to 150%)
  const [workspaceZoom, setWorkspaceZoom] = useState<number>(100);

  // Dynamically ensure document viewport meta tag allows deep mobile zoom
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=0.7, minimum-scale=0.3, maximum-scale=3.0, user-scalable=yes');
    }
  }, []);
 // Permanently remove "A" & Sun/Moon, and force Sign In button to be visible
  useEffect(() => {
    const cleanHeader = () => {
      document.querySelectorAll('header button').forEach((btn) => {
        const text = btn.textContent?.trim() || '';
        const hasSvg = btn.querySelector('svg');

        // 1. Remove 'A' button
        if (text === 'A' || btn.getAttribute('data-text-size-toggle') !== null) {
          (btn as HTMLElement).style.setProperty('display', 'none', 'important');
          return;
        }

        // 2. Remove Sun / Moon button
        if (hasSvg && !text.toLowerCase().includes('sign')) {
          (btn as HTMLElement).style.setProperty('display', 'none', 'important');
          return;
        }

        // 3. Make Sign In button visible with bold white text on dark pill
        if (text.toLowerCase().includes('sign')) {
          (btn as HTMLElement).style.setProperty('display', 'inline-flex', 'important');
          (btn as HTMLElement).style.setProperty('color', '#ffffff', 'important');
          (btn as HTMLElement).style.setProperty('background-color', '#18181b', 'important');
          (btn as HTMLElement).style.setProperty('border', '1px solid #3f3f46', 'important');
          (btn as HTMLElement).style.setProperty('font-weight', '700', 'important');
        }
      });
    };

    cleanHeader();
    const interval = setInterval(cleanHeader, 250);
    return () => clearInterval(interval);
  }, []);

  // Strict Multi-Screen State Router: 'home' | 'subject' | 'solver'
  const [view, setView] = useState<'home' | 'subject' | 'solver'>('home');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('physics');
  const [activeFormulaId, setActiveFormulaId] = useState<string>('ohms-law');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedStep, setCopiedStep] = useState(false);
  const [isStepsOpen, setIsStepsOpen] = useState(false);

  // Current parameter values map
  const [paramState, setParamState] = useState<Record<string, Record<string, number>>>({});

  // Active formula lookup
  const activeFormula: FormulaItem = useMemo(() => {
    const found = FORMULA_REGISTRY.find((f) => f.id === activeFormulaId);
    return found || FORMULA_REGISTRY[0];
  }, [activeFormulaId]);

  // Current parameters for active formula
  const currentParams = useMemo(() => {
    const defaults: Record<string, number> = {};
    activeFormula.params.forEach((p) => {
      defaults[p.key] = p.defaultVal;
    });
    return { ...defaults, ...(paramState[activeFormula.id] || {}) };
  }, [activeFormula, paramState]);

  // Real-time calculated result
  const calcResult = useMemo(() => {
    try {
      return activeFormula.calculate(currentParams);
    } catch {
      return {
        primaryValue: '0.00',
        primaryUnit: '',
        primarySymbol: '?',
        substitutionSteps: ['Calculation error occurred with provided parameters.'],
        metrics: [],
      };
    }
  }, [activeFormula, currentParams]);

  // Subject statistics
  const subjectCounts = useMemo(() => {
    return {
      physics: FORMULA_REGISTRY.filter((f) => f.subject === 'physics').length,
      math: FORMULA_REGISTRY.filter((f) => f.subject === 'math').length,
      chemistry: FORMULA_REGISTRY.filter((f) => f.subject === 'chemistry').length,
    };
  }, []);

  // Subject categories list
  const subjectCategories = useMemo(() => {
    const formulas = FORMULA_REGISTRY.filter((f) => f.subject === selectedSubject);
    const cats = Array.from(new Set(formulas.map((f) => f.category)));
    return ['All', ...cats];
  }, [selectedSubject]);

  // Filtered formulas for Screen 2 (Subject Hub)
  const filteredSubjectFormulas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FORMULA_REGISTRY.filter((item) => {
      if (item.subject !== selectedSubject) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.equation.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [selectedSubject, selectedCategory, searchQuery]);

  const handleParamChange = (paramKey: string, val: number) => {
    setParamState((prev) => ({
      ...prev,
      [activeFormula.id]: {
        ...(prev[activeFormula.id] || {}),
        [paramKey]: val,
      },
    }));
  };

  const handleResetParams = () => {
    setParamState((prev) => {
      const updated = { ...prev };
      delete updated[activeFormula.id];
      return updated;
    });
  };

  const handleCopySteps = () => {
    const text = [
      `${activeFormula.title} — ${activeFormula.equation}`,
      `Calculation Steps:`,
      ...calcResult.substitutionSteps.map((s, i) => `${i + 1}. ${s}`),
      `Result: ${calcResult.primarySymbol} = ${calcResult.primaryValue} ${calcResult.primaryUnit}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  };

  const openSubject = (subject: SubjectType) => {
    setSelectedSubject(subject);
    setSelectedCategory('All');
    setSearchQuery('');
    setView('subject');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSolver = (formula: FormulaItem) => {
    setActiveFormulaId(formula.id);
    setSelectedSubject(formula.subject);
    setView('solver');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Sub-header Zoom Handlers (40% to 150%)
  const handleZoomOutWorkspace = () => {
    setWorkspaceZoom((prev) => Math.max(40, prev - 10));
  };

  const handleZoomInWorkspace = () => {
    setWorkspaceZoom((prev) => Math.min(150, prev + 10));
  };

  const handleToggleFitPreset = () => {
    setWorkspaceZoom((prev) => (prev === 100 ? 65 : 100));
  };

  // Subject metadata mapping
  const subjectMeta = {
    physics: {
      name: 'Physics Lab',
      icon: Zap,
      accent: 'amber',
      accentColor: '#b45309',
      borderHover: 'hover:border-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      topics: 'Kinematics, Circuits, Waves, Mechanics, Gravitation & Optics',
    },
    math: {
      name: 'Mathematics Lab',
      icon: Compass,
      accent: 'indigo',
      accentColor: '#4f46e5',
      borderHover: 'hover:border-indigo-500',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      topics: 'Geometry, Algebra, Trigonometry, Sequences & Combinatorics',
    },
    chemistry: {
      name: 'Chemistry Lab',
      icon: FlaskConical,
      accent: 'emerald',
      accentColor: '#059669',
      borderHover: 'hover:border-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      topics: 'Gas Laws, Solutions, Thermodynamics, pH & Decay',
    },
  };

  return (
    <FasShell app={fas} appName="FormulaPad">
      <div 
        className="w-full min-h-[100svh] overflow-x-auto overflow-y-auto box-border"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <div 
         className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 font-sans text-[var(--ink,#0f172a)] min-h-[calc(100svh-80px)] pb-16 w-full max-w-full box-border"
          style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
        >
        
        {/* ========================================================================= */}
        {/* SCREEN 1: LANDING HUB (view === 'home')                                   */}
        {/* ========================================================================= */}
        {view === 'home' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* High-Impact Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 pt-2 sm:pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>40 Interactive Calculators & Live Visualizers</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--ink,#0f172a)] font-serif leading-tight">
                FormulaPad — Interactive Science & Math Lab
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[var(--muted,#475569)] leading-relaxed max-w-2xl mx-auto">
                Explore, compute, and visualize equations with real-time parameter sliders, 
                exact algebraic substitution steps, and animated scientific models.
              </p>
            </div>

            {/* 3 Distinct Subject Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
              {/* Physics Portal Card */}
              <div
                onClick={() => openSubject('physics')}
                className="group relative rounded-3xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] hover:border-amber-500 p-5 sm:p-7 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {subjectCounts.physics} Formulas
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink,#0f172a)] group-hover:text-amber-600 transition-colors">
                      ⚡ Physics Lab
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted,#475569)] mt-1.5 leading-relaxed">
                      Kinematics, Circuits, Waves, Mechanics, Gravitation & Optics.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border,#e2e8f0)] space-y-1 text-xs text-[var(--muted,#475569)] font-mono">
                    <div className="flex justify-between"><span>Ohm's Law:</span> <span className="font-bold text-[var(--ink,#0f172a)]">I = V / R</span></div>
                    <div className="flex justify-between"><span>Projectile Range:</span> <span className="font-bold text-[var(--ink,#0f172a)]">R = v₀²sin(2θ)/g</span></div>
                    <div className="flex justify-between"><span>Kinetic Energy:</span> <span className="font-bold text-[var(--ink,#0f172a)]">E_k = ½mv²</span></div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-[var(--border,#e2e8f0)] flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600">
                  <span>Enter Physics Lab</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Mathematics Portal Card */}
              <div
                onClick={() => openSubject('math')}
                className="group relative rounded-3xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] hover:border-indigo-500 p-5 sm:p-7 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                      <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      {subjectCounts.math} Formulas
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink,#0f172a)] group-hover:text-indigo-600 transition-colors">
                      📐 Mathematics Lab
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted,#475569)] mt-1.5 leading-relaxed">
                      Geometry, Algebra, Trig, Series, Finance & Combinatorics.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border,#e2e8f0)] space-y-1 text-xs text-[var(--muted,#475569)] font-mono">
                    <div className="flex justify-between"><span>Pythagorean:</span> <span className="font-bold text-[var(--ink,#0f172a)]">c = √(a² + b²)</span></div>
                    <div className="flex justify-between"><span>Quadratic:</span> <span className="font-bold text-[var(--ink,#0f172a)]">x = (-b±√Δ)/2a</span></div>
                    <div className="flex justify-between"><span>Compound Int:</span> <span className="font-bold text-[var(--ink,#0f172a)]">A = P(1+r/n)ⁿᵗ</span></div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-[var(--border,#e2e8f0)] flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-600">
                  <span>Enter Mathematics Lab</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Chemistry Portal Card */}
              <div
                onClick={() => openSubject('chemistry')}
                className="group relative rounded-3xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] hover:border-emerald-500 p-5 sm:p-7 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                      <FlaskConical className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {subjectCounts.chemistry} Formulas
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink,#0f172a)] group-hover:text-emerald-600 transition-colors">
                      🧪 Chemistry Lab
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted,#475569)] mt-1.5 leading-relaxed">
                      Gas Laws, Solutions, Thermodynamics, pH & Half-Life Decay.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border,#e2e8f0)] space-y-1 text-xs text-[var(--muted,#475569)] font-mono">
                    <div className="flex justify-between"><span>Ideal Gas Law:</span> <span className="font-bold text-[var(--ink,#0f172a)]">P = nRT / V</span></div>
                    <div className="flex justify-between"><span>pH Calculation:</span> <span className="font-bold text-[var(--ink,#0f172a)]">pH = -log₁₀[H⁺]</span></div>
                    <div className="flex justify-between"><span>Solution Dilution:</span> <span className="font-bold text-[var(--ink,#0f172a)]">M₁V₁ = M₂V₂</span></div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-[var(--border,#e2e8f0)] flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-600">
                  <span>Enter Chemistry Lab</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: DEDICATED SUBJECT HUB (view === 'subject')                      */}
        {/* ========================================================================= */}
        {view === 'subject' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Header Navigation Bar: Back Button, Subject Title, Search Input */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border,#e2e8f0)] pb-4">
              <div className="flex items-center gap-3">
                <button
  type="button"
  onClick={() => setView('home')}
  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
>
  <ArrowLeft className="w-4 h-4" />
  <span>Back to Subjects</span>
</button>
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-xl ${subjectMeta[selectedSubject].badgeBg}`}>
                    {React.createElement(subjectMeta[selectedSubject].icon, { className: 'w-5 h-5' })}
                  </span>
                  <h1 className="text-lg sm:text-2xl font-bold text-[var(--ink,#0f172a)]">
                    {subjectMeta[selectedSubject].name}
                  </h1>
                </div>
              </div>

              {/* Real-Time Formula Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={`Search ${subjectMeta[selectedSubject].name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {subjectCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Formula Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredSubjectFormulas.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openSolver(item)}
                  className="group rounded-2xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] hover:border-emerald-500 p-4 sm:p-5 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {item.category}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[var(--ink,#0f172a)] group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h2>

                    <div className="p-2 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs sm:text-sm font-bold border border-zinc-800 tracking-wide text-center">
                      {item.equation}
                    </div>

                    <p className="text-xs text-[var(--muted,#475569)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border,#e2e8f0)] flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Launch Simulator</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {filteredSubjectFormulas.length === 0 && (
              <div className="text-center py-12 rounded-3xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] space-y-2">
                <Search className="w-8 h-8 mx-auto text-zinc-400" />
                <h3 className="text-base font-bold text-[var(--ink,#0f172a)]">No formulas found</h3>
                <p className="text-xs text-[var(--muted,#475569)]">
                  Try adjusting your search query or select another category.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: DEDICATED INTERACTIVE FORMULA SIMULATOR (view === 'solver')    */}
        {/* ========================================================================= */}
        {view === 'solver' && (
          <div className="space-y-3 sm:space-y-5 animate-in fade-in duration-200 relative">
            
            {/* Top Navigation Bar: Back Button + Title + Zoom-Out Controller + Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[var(--border,#e2e8f0)] pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
  type="button"
  onClick={() => setView('subject')}
  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
>
  <ArrowLeft className="w-4 h-4" />
  <span>Back to {subjectMeta[activeFormula.subject].name}</span>
</button>

                {/* Deep Zoom-Out Controller in Sub-Header beside Back button */}
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-xs font-mono shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleZoomOutWorkspace}
                    disabled={workspaceZoom <= 40}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer touch-manipulation"
                    title="Zoom Out Workspace (down to 40%)"
                    aria-label="Zoom Out Workspace"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFitPreset}
                    className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-zinc-600 transition-all cursor-pointer touch-manipulation hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Toggle 100% standard vs 65% compact fit-to-screen"
                  >
                    {workspaceZoom}%
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomInWorkspace}
                    disabled={workspaceZoom >= 150}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer touch-manipulation"
                    title="Zoom In Workspace (up to 150%)"
                    aria-label="Zoom In Workspace"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--muted,#475569)] dark:text-zinc-400 truncate">
                    <span className="capitalize">{activeFormula.subject}</span>
                    <span>/</span>
                    <span className="truncate">{activeFormula.category}</span>
                  </div>
                  <h2 className="text-sm sm:text-xl font-bold text-[var(--ink,#0f172a)] leading-tight truncate">
                    {activeFormula.title}
                  </h2>
                </div>
              </div>

              {/* Right Controls: Formula Dropdown */}
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <select
                  value={activeFormula.id}
                  onChange={(e) => setActiveFormulaId(e.target.value)}
                  className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer max-w-[220px] sm:max-w-none truncate shadow-2xs"
                >
                  {FORMULA_REGISTRY.filter((f) => f.subject === activeFormula.subject).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.equation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2D Scroll Viewport & Scaling Container */}
            <div 
            className="w-full min-h-[100svh] overflow-x-auto overflow-y-auto box-border"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
            >
              <div
                style={{
                  transform: `scale(${workspaceZoom / 100})`,
                  // When zoomed in (>=100%), anchor to top-left so it expands rightward without left-clipping:
                  transformOrigin: workspaceZoom >= 100 ? 'top left' : 'top center',
                  width: workspaceZoom < 100 ? '100%' : 'max-content',
                  minWidth: '100%',
                  margin: workspaceZoom >= 100 ? '0' : '0 auto',
                  paddingRight: workspaceZoom > 100 ? `${(workspaceZoom - 100) * 0.5}rem` : 0,
                  paddingBottom: workspaceZoom > 100 ? `${(workspaceZoom - 100) * 0.5}rem` : 0,
                  boxSizing: 'border-box',
                  transition: 'transform 0.15s ease-out',
                }}
                className="space-y-3 sm:space-y-4 w-full max-w-full box-border"
              >
                {/* Mobile Zero-Scroll Sticky Live Metric HUD */}
              <div className="sticky top-0 sm:hidden z-30 -mx-2 px-2.5 py-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-y border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {activeFormula.equation}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono shrink-0">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {calcResult.primarySymbol} =
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {calcResult.primaryValue}
                  </span>
                  {calcResult.primaryUnit && (
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      {calcResult.primaryUnit}
                    </span>
                  )}
                </div>
              </div>

              {/* Strict Two-Column Layout (Desktop) / Clean Stack (Mobile) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start">
                
                {/* LEFT COLUMN: Interactive Controls & Parameter Sliders */}
                <div className="lg:col-span-5 space-y-2.5 sm:space-y-4">
                  <div className="rounded-2xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] p-2.5 sm:p-5 space-y-2 sm:space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[var(--border,#e2e8f0)] pb-1.5 sm:pb-2.5">
                      <span className="text-xs sm:text-sm font-bold text-[var(--ink,#0f172a)] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                        Dynamic Parameters
                      </span>
                      <button
                        onClick={handleResetParams}
                        className="min-h-[26px] sm:min-h-[30px] px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-lg border border-[var(--border,#e2e8f0)] bg-[var(--surface-subtle,#f8fafc)] text-[var(--muted,#475569)] hover:text-[var(--ink,#0f172a)] flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
                        title="Reset parameters to defaults"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>

                    {/* Parameter Controls List */}
                    <div className="space-y-1.5 sm:space-y-3">
                      {activeFormula.id === 'ph-calculation' ? (
                        <PhLabControl
                          currentNegLogH={currentParams['negLogH'] ?? 7.0}
                          onChangeNegLogH={(val) => handleParamChange('negLogH', val)}
                        />
                      ) : (
                        activeFormula.params.map((param) => (
                          <ParamControl
                            key={param.key}
                            param={param}
                            value={currentParams[param.key] ?? param.defaultVal}
                            onChange={(val) => handleParamChange(param.key, val)}
                          />
                        ))
                      )}
                    </div>

                    {/* Formula Description Card */}
                    <div className="p-2 sm:p-3 rounded-xl bg-[var(--surface-subtle,#f8fafc)] border border-[var(--border,#e2e8f0)] text-[10px] sm:text-xs text-[var(--muted,#475569)] leading-relaxed">
                      <strong className="text-[var(--ink,#0f172a)] font-semibold">About this formula: </strong>
                      {activeFormula.description}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Visualizer & Step-by-Step Results */}
                <div className="lg:col-span-7 space-y-2.5 sm:space-y-4">
                  
                  {/* Prominent Primary Calculated Output */}
                  <div className="rounded-2xl bg-[var(--card,#ffffff)] border-2 border-emerald-500/40 p-2.5 sm:p-5 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Calculated Output ({calcResult.primarySymbol})
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {activeFormula.equation}
                      </span>
                    </div>

                    <div className="mt-1.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-[var(--ink,#0f172a)]">
                        {calcResult.primaryValue}
                      </span>
                      {calcResult.primaryUnit && (
                        <span className="text-xs sm:text-base md:text-lg font-bold text-[var(--muted,#475569)]">
                          {calcResult.primaryUnit}
                        </span>
                      )}
                    </div>

                    {/* Secondary Metrics */}
                    {calcResult.metrics.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--border,#e2e8f0)]">
                        {calcResult.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 sm:p-2.5 rounded-xl bg-[var(--surface-subtle,#f8fafc)] border border-[var(--border,#e2e8f0)]"
                          >
                            <span className="text-[8px] sm:text-[11px] font-bold text-[var(--muted,#475569)] uppercase tracking-wider block truncate">
                              {m.label}
                            </span>
                            <div className="text-[11px] sm:text-sm md:text-base font-bold font-mono text-[var(--ink,#0f172a)] mt-0.5 truncate">
                              {m.value} <span className="text-[9px] sm:text-xs text-[var(--muted,#475569)] font-sans">{m.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive SVG Diagram & Simulation Canvas with Deep Zoom-Out */}
                  <VisualCanvas
                    title={`${activeFormula.title} — Real-Time Model`}
                  >
                    {activeFormula.renderVisual ? (
                      activeFormula.renderVisual(currentParams, calcResult)
                    ) : (
                      /* Proportional Distribution Gauge */
                      <div className="w-full bg-zinc-950 rounded-xl p-2 sm:p-3 border border-zinc-800 space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-400 font-mono pb-1 sm:pb-2 border-b border-zinc-800">
                          <span>Parameter Distribution & Balance</span>
                          <span>Real-time Synthesis</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 pt-1">
                          {activeFormula.params.map((p) => {
                            const val = currentParams[p.key] ?? p.defaultVal;
                            const pct = Math.min(100, Math.max(5, ((val - p.min) / (p.max - p.min || 1)) * 100));
                            return (
                              <div key={p.key} className="space-y-0.5 sm:space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs font-mono text-zinc-300">
                                  <span>{p.label} ({p.symbol})</span>
                                  <span className="text-emerald-400 font-bold">{val} {p.unit}</span>
                                </div>
                                <div className="w-full h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-150"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </VisualCanvas>

                  {/* Collapsible Accordion: Step-by-Step Algebraic Substitution Walkthrough */}
                  <div className="rounded-2xl bg-[var(--card,#ffffff)] border border-[var(--border,#e2e8f0)] p-2.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xs">
                    <div 
                      onClick={() => setIsStepsOpen(!isStepsOpen)}
                      className="flex items-center justify-between pb-1 cursor-pointer select-none group"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[var(--ink,#0f172a)] flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                        <span>Step-by-Step Algebraic Substitution</span>
                        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {calcResult.substitutionSteps.length} steps
                        </span>
                      </span>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySteps();
                          }}
                          className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg border border-[var(--border,#e2e8f0)] bg-[var(--surface-subtle,#f8fafc)] hover:bg-[var(--card,#ffffff)] text-[var(--muted,#475569)] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy calculation steps"
                        >
                          {copiedStep ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          <span className="hidden sm:inline">{copiedStep ? 'Copied' : 'Copy'}</span>
                        </button>
                        
                        <div className="p-0.5 sm:p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-transform">
                          {isStepsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isStepsOpen && (
                      <div className="space-y-1 sm:space-y-1.5 font-mono text-[11px] sm:text-sm text-[var(--muted,#475569)] bg-[var(--surface-subtle,#f8fafc)] p-2.5 sm:p-3 rounded-xl border border-[var(--border,#e2e8f0)] overflow-x-auto animate-in fade-in duration-150">
                        {calcResult.substitutionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 sm:gap-2">
                            <span className="text-zinc-400 select-none">{idx + 1}.</span>
                            <span className="text-[var(--ink,#0f172a)] font-medium break-all">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
            </div>
          </div>
        )}
        {/* FreeAppStore Attribution Footer */}
        <footer className="w-full py-6 text-center text-xs opacity-70 border-t border-[var(--border,#e2e8f0)] mt-8">
          <p>
            FormulaPad •{' '}
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-100"
            >
              Built for freeappstore.online
            </a>
          </p>
        </footer> 
        
      </div>
      </div>
    </FasShell>
  );
}
