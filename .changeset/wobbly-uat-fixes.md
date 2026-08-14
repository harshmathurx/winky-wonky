---
"winky-wonky": patch
---

Fix functional bugs found in a manual UAT pass: Grumpy Modal's trigger button did nothing (inline styles set in JS were permanently overriding the CSS class that opened it); Gravity Toast could visually shift the trigger button around the page as toasts stacked up (toasts are now a fixed-position stack, out of normal document flow); and Rotary Color Picker's dial holes rendered partly outside the dial's circle (a hardcoded center offset didn't match the dial's actual CSS size).
