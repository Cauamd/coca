(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/AuthShell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toggle$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/toggle-theme.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Nav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function AuthShell({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [authorized, setAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [checking, setChecking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [centro, setCentro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showEntryTransition, setShowEntryTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthShell.useEffect": ()=>{
            if (pathname === "/login") {
                setChecking(false);
                setAuthorized(false);
                return;
            }
            let active = true;
            setChecking(true);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchSession"])().then({
                "AuthShell.useEffect": (session)=>{
                    if (!active) return;
                    setCentro(session.centro);
                    if (sessionStorage.getItem("coca-cola-entry-transition") === "1") {
                        sessionStorage.removeItem("coca-cola-entry-transition");
                        setShowEntryTransition(true);
                        window.setTimeout({
                            "AuthShell.useEffect": ()=>setShowEntryTransition(false)
                        }["AuthShell.useEffect"], 3000);
                    }
                    setAuthorized(true);
                    setChecking(false);
                }
            }["AuthShell.useEffect"]).catch({
                "AuthShell.useEffect": ()=>{
                    if (!active) return;
                    setAuthorized(false);
                    setChecking(false);
                    router.replace("/login");
                }
            }["AuthShell.useEffect"]);
            return ({
                "AuthShell.useEffect": ()=>{
                    active = false;
                }
            })["AuthShell.useEffect"];
        }
    }["AuthShell.useEffect"], [
        pathname,
        router
    ]);
    if (pathname === "/login") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/components/AuthShell.tsx",
        lineNumber: 45,
        columnNumber: 37
    }, this);
    if (checking || !authorized) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        "aria-label": "Verificando acesso"
    }, void 0, false, {
        fileName: "[project]/components/AuthShell.tsx",
        lineNumber: 46,
        columnNumber: 39
    }, this);
    async function handleLogout() {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logoutAdmin"])();
        setAuthorized(false);
        router.replace("/login");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-654c3d41c0705240" + " " + ((showEntryTransition ? "entry-page entry-page-moving" : "entry-page") || ""),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "jsx-654c3d41c0705240" + " " + "global-header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-654c3d41c0705240" + " " + "global-header-inner",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "brand",
                                    "aria-label": "Página inicial",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "https://coca-cola-femsa.com.br/wp-content/uploads/2023/01/logo-femsa.png",
                                        alt: "Coca-Cola FEMSA",
                                        className: "jsx-654c3d41c0705240" + " " + "brand-logo"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AuthShell.tsx",
                                        lineNumber: 59,
                                        columnNumber: 72
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthShell.tsx",
                                    lineNumber: 59,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/components/AuthShell.tsx",
                                    lineNumber: 60,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-654c3d41c0705240" + " " + "flex items-center gap-3 px-2 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-654c3d41c0705240" + " " + "whitespace-nowrap",
                                            children: [
                                                "Centro: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "jsx-654c3d41c0705240",
                                                    children: centro
                                                }, void 0, false, {
                                                    fileName: "[project]/components/AuthShell.tsx",
                                                    lineNumber: 62,
                                                    columnNumber: 57
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/AuthShell.tsx",
                                            lineNumber: 62,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toggle$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToggleTheme"], {}, void 0, false, {
                                            fileName: "[project]/components/AuthShell.tsx",
                                            lineNumber: 63,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>void handleLogout(),
                                            className: "jsx-654c3d41c0705240" + " " + "btn-secondary",
                                            children: "Sair"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AuthShell.tsx",
                                            lineNumber: 64,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AuthShell.tsx",
                                    lineNumber: 61,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthShell.tsx",
                            lineNumber: 58,
                            columnNumber: 9
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AuthShell.tsx",
                        lineNumber: 57,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-654c3d41c0705240" + " " + "app-content",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/AuthShell.tsx",
                        lineNumber: 68,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AuthShell.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            showEntryTransition && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                "aria-label": "Bem-vindo",
                className: "jsx-654c3d41c0705240" + " " + "entry-transition",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: "https://coca-cola-femsa.com.br/wp-content/uploads/2023/01/logo-femsa.png",
                    alt: "Coca-Cola FEMSA",
                    className: "jsx-654c3d41c0705240"
                }, void 0, false, {
                    fileName: "[project]/components/AuthShell.tsx",
                    lineNumber: 72,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/AuthShell.tsx",
                lineNumber: 71,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "654c3d41c0705240",
                children: ".entry-page-moving.jsx-654c3d41c0705240{will-change:transform;animation:3s cubic-bezier(.35,.05,.25,1) both page-push-in}.entry-transition.jsx-654c3d41c0705240{z-index:1000;pointer-events:none;will-change:transform, opacity;background:radial-gradient(circle,#f40009 0%,#c90008 56%,#8f0005 100%);place-items:center;animation:3s cubic-bezier(.35,.05,.25,1) both entry-wipe;display:grid;position:fixed;inset:0}.entry-transition.jsx-654c3d41c0705240 img.jsx-654c3d41c0705240{object-fit:contain;filter:drop-shadow(0 10px 26px #32000047);width:min(250px,64vw);height:82px;animation:3s cubic-bezier(.35,.05,.25,1) both entry-logo}@keyframes entry-wipe{0%{opacity:1;transform:translate(-100%)}24%{opacity:1;transform:translate(0)}70%{opacity:1;transform:translate(0)}to{opacity:0;transform:translate(100%)}}@keyframes page-push-in{0%,24%{transform:translate(0)}70%{transform:translate(-14px)}to{transform:translate(0)}}@keyframes entry-logo{0%{opacity:0;transform:translate(-48px)scale(.9)}24%{opacity:1;transform:translate(0)scale(1)}72%{opacity:1;transform:translate(0)scale(1)}to{opacity:0;transform:translate(48px)scale(.98)}}@media (prefers-reduced-motion:reduce){.entry-transition.jsx-654c3d41c0705240,.entry-transition.jsx-654c3d41c0705240 img.jsx-654c3d41c0705240{animation-duration:1ms}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AuthShell.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s(AuthShell, "9MbUUz2RWHoANtlDruhgWBNmcJ4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthShell;
var _c;
__turbopack_context__.k.register(_c, "AuthShell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Nav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const NAV_ITEMS = [
    {
        href: "/",
        label: "Início"
    },
    {
        href: "/upload",
        label: "Importar"
    },
    {
        href: "/dados",
        label: "Apontamentos"
    },
    {
        href: "/dashboard",
        label: "Pareto"
    },
    {
        href: "/dashboard/jack-knife",
        label: "Crítico-Crônico"
    },
    {
        href: "/alertas",
        label: "Alertas"
    },
    {
        href: "/classificacao",
        label: "Dicionário"
    }
];
function Nav() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const navRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Atualiza --mx/--my do link sob o cursor, para o gradiente radial "seguir a Ã¡gua"
    function handlePointerMove(e) {
        const target = e.target.closest(".nav-link");
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        target.style.setProperty("--mx", `${x}%`);
        target.style.setProperty("--my", `${y}%`);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "main-nav",
        ref: navRef,
        onPointerMove: handlePointerMove,
        children: NAV_ITEMS.map((item)=>{
            const isActive = pathname === item.href;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: item.href,
                className: isActive ? "nav-link active" : "nav-link",
                children: item.label
            }, item.href, false, {
                fileName: "[project]/components/Nav.tsx",
                lineNumber: 37,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/Nav.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(Nav, "NenurArdrEIaJybbpxuOSMhKp3E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Nav;
var _c;
__turbopack_context__.k.register(_c, "Nav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
"use client";
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "data-theme",
        storageKey: "tema",
        defaultTheme: "light",
        enableSystem: true,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/Providers.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/toggle-theme.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToggleTheme",
    ()=>ToggleTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$cog$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorCogIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor-cog.mjs [app-client] (ecmascript) <export default as MonitorCogIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2d$star$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoonStarIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon-star.mjs [app-client] (ecmascript) <export default as MoonStarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SunIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.mjs [app-client] (ecmascript) <export default as SunIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const THEME_OPTIONS = [
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$cog$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorCogIcon$3e$__["MonitorCogIcon"],
        value: "system"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SunIcon$3e$__["SunIcon"],
        value: "light"
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2d$star$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoonStarIcon$3e$__["MoonStarIcon"],
        value: "dark"
    }
];
function ToggleTheme() {
    _s();
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [isMounted, setIsMounted] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ToggleTheme.useEffect": ()=>setIsMounted(true)
    }["ToggleTheme.useEffect"], []);
    if (!isMounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "theme-toggle-placeholder",
            "aria-hidden": "true"
        }, void 0, false, {
            fileName: "[project]/components/ui/toggle-theme.tsx",
            lineNumber: 22,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        transition: {
            duration: 0.3
        },
        className: "theme-toggle-group",
        role: "radiogroup",
        "aria-label": "Tema de aparência",
        children: THEME_OPTIONS.map((option)=>{
            const Icon = option.icon;
            const selected = theme === option.value;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("theme-toggle-option", selected && "selected"),
                role: "radio",
                "aria-checked": selected,
                "aria-label": `Usar tema ${option.value === "system" ? "do sistema" : option.value === "light" ? "claro" : "escuro"}`,
                title: option.value === "system" ? "Tema do sistema" : `Tema ${option.value === "light" ? "claro" : "escuro"}`,
                onClick: ()=>setTheme(option.value),
                children: [
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                        layoutId: "theme-option",
                        transition: {
                            type: "spring",
                            bounce: 0.1,
                            duration: 0.75
                        },
                        className: "theme-toggle-indicator",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/toggle-theme.tsx",
                        lineNumber: 50,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: "theme-toggle-icon",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/toggle-theme.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, this)
                ]
            }, option.value, true, {
                fileName: "[project]/components/ui/toggle-theme.tsx",
                lineNumber: 39,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/ui/toggle-theme.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(ToggleTheme, "WyZkjzB+JAjPRjkCGAFUlPw/Z9U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ToggleTheme;
var _c;
__turbopack_context__.k.register(_c, "ToggleTheme");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addKeyword",
    ()=>addKeyword,
    "buildExportUrl",
    ()=>buildExportUrl,
    "downloadExport",
    ()=>downloadExport,
    "fetchAlertas",
    ()=>fetchAlertas,
    "fetchApontamentos",
    ()=>fetchApontamentos,
    "fetchApontamentosCount",
    ()=>fetchApontamentosCount,
    "fetchCentros",
    ()=>fetchCentros,
    "fetchFiltros",
    ()=>fetchFiltros,
    "fetchJackKnife",
    ()=>fetchJackKnife,
    "fetchModosFalha",
    ()=>fetchModosFalha,
    "fetchPareto",
    ()=>fetchPareto,
    "fetchPlano",
    ()=>fetchPlano,
    "fetchSession",
    ()=>fetchSession,
    "fetchSuggestions",
    ()=>fetchSuggestions,
    "loginAdmin",
    ()=>loginAdmin,
    "logoutAdmin",
    ()=>logoutAdmin,
    "savePlano",
    ()=>savePlano,
    "updateClassificacao",
    ()=>updateClassificacao
]);
const API_URL = "/api";
async function fetchCentros() {
    const res = await fetch(`${API_URL}/auth/centros-disponiveis`, {
        credentials: "include"
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || `Não foi possível carregar os centros (HTTP ${res.status}).`);
    }
    const data = await res.json();
    if (!Array.isArray(data.centros)) throw new Error("A resposta da API de centros está em formato inválido.");
    return data.centros;
}
async function loginAdmin(usuario, senha, centro) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario,
            senha,
            centro
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || "Não foi possível entrar");
    }
}
async function logoutAdmin() {
    await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });
}
async function fetchSession() {
    const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Sessão inválida");
    return res.json();
}
async function fetchApontamentos(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value])=>{
        if (value !== undefined && value !== "") query.set(key, String(value));
    });
    const res = await fetch(`${API_URL}/apontamentos?${query.toString()}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar apontamentos");
    return res.json();
}
async function fetchFiltros() {
    const res = await fetch(`${API_URL}/apontamentos/filtros`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar filtros");
    return res.json();
}
async function fetchModosFalha() {
    const res = await fetch(`${API_URL}/classificacao/modos-falha`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar modos de falha");
    return res.json();
}
async function updateClassificacao(id, modoFalhaId) {
    const res = await fetch(`${API_URL}/classificacao/apontamentos/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            modo_falha_id: modoFalhaId
        })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro ao classificar apontamento");
    }
    const data = await res.json();
    return data.apontamento;
}
async function fetchPareto(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value])=>{
        if (value) query.set(key, value);
    });
    const res = await fetch(`${API_URL}/dashboard/pareto-modo-falha?${query.toString()}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar Pareto");
    return res.json();
}
async function fetchJackKnife(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value])=>{
        if (value) query.set(key, value);
    });
    const res = await fetch(`${API_URL}/dashboard/jack-knife?${query.toString()}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar Jack-Knife");
    return res.json();
}
async function fetchApontamentosCount() {
    const res = await fetchApontamentos({
        page: 1,
        pageSize: 1,
        apenas_validos: true
    });
    return res.pagination.total;
}
async function fetchSuggestions(minOccurrences = 5) {
    const res = await fetch(`${API_URL}/classificacao/sugestoes?min=${minOccurrences}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar sugestões");
    return res.json();
}
async function addKeyword(modoFalhaId, palavraChave, prioridade = 5) {
    const res = await fetch(`${API_URL}/classificacao/palavras-chave`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            modo_falha_id: modoFalhaId,
            palavra_chave: palavraChave,
            prioridade
        })
    });
    if (!res.ok) throw new Error("Erro ao adicionar palavra-chave");
    return res.json();
}
function buildExportUrl(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value])=>{
        if (value !== undefined && value !== "" && key !== "page" && key !== "pageSize" && key !== "orderBy" && key !== "orderDir") {
            query.set(key, String(value));
        }
    });
    return `${API_URL}/apontamentos/export?${query.toString()}`;
}
async function downloadExport(params) {
    const url = buildExportUrl(params);
    const res = await fetch(url, {
        credentials: "include"
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || "Erro ao exportar dados");
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    const contentDisposition = res.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    link.download = filenameMatch ? filenameMatch[1] : "apontamentos.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
}
async function fetchAlertas() {
    const res = await fetch(`${API_URL}/planos-acao`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar alertas");
    return res.json();
}
async function fetchPlano(linha, equipamento) {
    const res = await fetch(`${API_URL}/planos-acao/${encodeURIComponent(linha)}/${encodeURIComponent(equipamento)}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao buscar plano de ação");
    return res.json();
}
async function savePlano(linha, equipamento, plano) {
    const res = await fetch(`${API_URL}/planos-acao/${encodeURIComponent(linha)}/${encodeURIComponent(equipamento)}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(plano)
    });
    if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || "Erro ao salvar plano de ação");
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
function cn(...values) {
    return values.filter(Boolean).join(" ");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0ztncr2._.js.map