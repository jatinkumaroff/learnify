import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { setAuthLoading, userLoggedOut } from "@/features/authSlice";

export const appStore = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) =>
    defaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware
    ),
});

// Called once on startup to hydrate auth state from the server session (cookie).
// Sets isLoading=false when done so route guards know it's safe to make decisions.
const initializeApp = async () => {
  try {
    await appStore.dispatch(
      authApi.endpoints.loadUser.initiate({}, { forceRefetch: true })
    );
  } catch {
    // Not authenticated - that's fine, just clear loading
    appStore.dispatch(userLoggedOut());
  } finally {
    appStore.dispatch(setAuthLoading(false));
  }
};

initializeApp();