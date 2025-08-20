import React, { createContext, useContext, useMemo, useReducer } from 'react';

/**
 * PUBLIC_INTERFACE
 * useSharing
 * This hook provides access to the Social Sharing state and actions.
 * It is prepared for future backend integration (CRUD for shares, feed posts, etc.).
 */
const SharingContext = createContext();

/**
 * Action types for the sharing reducer.
 */
const actionTypes = {
  INIT: 'INIT',
  ADD_SHARE: 'ADD_SHARE',
  UPDATE_SHARE: 'UPDATE_SHARE',
  DELETE_SHARE: 'DELETE_SHARE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

/**
 * Reducer to manage sharing-related state.
 */
function sharingReducer(state, action) {
  switch (action.type) {
    case actionTypes.INIT:
      return { ...state, items: action.payload || [], loading: false, error: null };
    case actionTypes.ADD_SHARE:
      return { ...state, items: [action.payload, ...state.items] };
    case actionTypes.UPDATE_SHARE:
      return {
        ...state,
        items: state.items.map((it) => (it.id === action.payload.id ? { ...it, ...action.payload } : it)),
      };
    case actionTypes.DELETE_SHARE:
      return {
        ...state,
        items: state.items.filter((it) => it.id !== action.payload),
      };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

/**
 * Generates a simple client-side id for placeholder items until backend is integrated.
 */
function genId() {
  return `local_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * PUBLIC_INTERFACE
 * SharingProvider
 * Provides social sharing state and actions to the component tree.
 */
export function SharingProvider({ children }) {
  const [state, dispatch] = useReducer(sharingReducer, {
    items: [],
    loading: false,
    error: null,
  });

  // Placeholder: in future, hydrate from backend
  // useEffect(() => { ...fetch and dispatch INIT... }, [])

  const actions = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      createShare: (data) => {
        /** Create a locally stored share record; to be replaced by API call */
        const newItem = {
          id: genId(),
          title: data.title || 'Shared Progress',
          type: data.type || 'feed', // feed | export
          content: data.content || {},
          createdAt: new Date().toISOString(),
          visibility: data.visibility || 'private', // private | public
          status: data.status || 'draft', // draft | published
          exportFormat: data.exportFormat || null, // csv | pdf
        };
        dispatch({ type: actionTypes.ADD_SHARE, payload: newItem });
        return newItem;
      },
      // PUBLIC_INTERFACE
      updateShare: (id, patch) => {
        /** Update a locally stored share record; to be replaced by API call */
        dispatch({ type: actionTypes.UPDATE_SHARE, payload: { id, ...patch } });
      },
      // PUBLIC_INTERFACE
      deleteShare: (id) => {
        /** Delete a locally stored share record; to be replaced by API call */
        dispatch({ type: actionTypes.DELETE_SHARE, payload: id });
      },
      // PUBLIC_INTERFACE
      listShares: () => {
        /** Return all locally stored share records; to be replaced by API call */
        return state.items;
      },
      // PUBLIC_INTERFACE
      setLoading: (flag) => dispatch({ type: actionTypes.SET_LOADING, payload: flag }),
      // PUBLIC_INTERFACE
      setError: (err) => dispatch({ type: actionTypes.SET_ERROR, payload: err }),
    }),
    [state.items]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <SharingContext.Provider value={value}>{children}</SharingContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useSharing
 * Access the SharingContext; throws if used outside provider.
 */
export function useSharing() {
  const ctx = useContext(SharingContext);
  if (!ctx) {
    throw new Error('useSharing must be used within SharingProvider');
  }
  return ctx;
}
