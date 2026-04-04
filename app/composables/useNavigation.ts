// --- Imports ---
import { $navigateBack, $navigateTo } from 'nativescript-vue';


// --- Composable ---
export function useNavigation(): {
    navigateTo: typeof $navigateTo;
    navigateBack: typeof $navigateBack;
} {
    return {
        navigateTo: $navigateTo,
        navigateBack: $navigateBack,
    };
}
