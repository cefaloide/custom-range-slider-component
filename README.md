# Custom Range Slider

A custom dual-handle `<Range />` component for React / Next.js, built from scratch without `<input type="range">`.

It supports two modes:

- **Normal** (`/exercise1`): continuous range between a `min` and a `max` fetched from a mocked API, with a configurable `step`. Both currency labels can be clicked and edited.
- **Fixed** (`/exercise2`): handles can only be placed on a set of values (`rangeValues`) fetched from a mocked API. Labels are read-only.

In both modes the handles can be dragged, they never cross each other, and a click on the track moves the closest handle there.

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev        # http://localhost:8080
```

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start the development server     |
| `npm run build`         | Production build                 |
| `npm start`             | Serve the production build       |
| `npm test`              | Run the tests in watch mode      |
| `npm run test:coverage` | Run the tests once with coverage |
| `npm run lint`          | Lint the project                 |

## Usage

```tsx
const [value, setValue] = useState<[number, number]>([10, 70]);

// Normal mode
<Range
  min={1}
  max={100}
  step={0.01}
  value={value}
  onChange={setValue}
/>

// Fixed mode
<Range
  mode="fixed"
  rangeValues={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]}
  value={value}
  onChange={setValue}
/>
```

### Props

| Prop             | Mode   | Default                 | Description                                  |
| ---------------- | ------ | ----------------------- | -------------------------------------------- |
| `value`          | both   | required                | Current `[min, max]` selection               |
| `onChange`       | both   | required                | Called with the new `[min, max]` selection   |
| `mode`           | both   | `"normal"`              | `"normal"` or `"fixed"`                      |
| `min`, `max`     | normal | required                | Range bounds                                 |
| `step`           | normal | `1`                     | Value increment                              |
| `allowLabelEdit` | normal | `true`                  | Lets the user type a value in the labels     |
| `rangeValues`    | fixed  | required                | Allowed values, in ascending order           |
| `currency`       | both   | `"€"`                   | Symbol appended to the values                |
| `showBounds`     | both   | `true`                  | Shows the "Min / Max" bounds above the track |
| `ariaLabelMin`   | both   | `"Minimum range value"` | Accessible name of the min handle            |
| `ariaLabelMax`   | both   | `"Maximum range value"` | Accessible name of the max handle            |
| `className`      | both   | `""`                    | Extra classes for the wrapper                |

The props are a discriminated union: TypeScript rejects invalid combinations such as `mode="fixed"` together with `min`, `max` or `step`.

## Project structure

```
app/
  api/normal/route.ts     Mocked service: { min, max }
  api/fixed/route.ts      Mocked service: { rangeValues }
  exercise1/page.tsx      Normal mode demo
  exercise2/page.tsx      Fixed mode demo
components/Range/
  Range.tsx               Composes the pieces below
  RangeTrack.tsx          Track line and highlighted selection
  RangeHandle.tsx         Draggable handle (role="slider")
  RangeLabel.tsx          Value label, editable in normal mode
  RangeBounds.tsx         "Min / Max" header
  hooks/
    useRangeModel.ts      Props -> limits, current values and percentages
    useRangeDrag.ts       Pointer dragging and track clicks
    useRangeKeyboard.ts   Arrow key navigation
hooks/useApiData.ts       Fetch with loading, error, retry and abort
lib/range-utils.ts        Pure helpers: clamping, value <-> percent, validation, formatting
types/api.ts              Response types shared by the API routes and the pages
```

## Design decisions

- **Controlled component.** `Range` holds no value state of its own. It renders `value` and reports changes through `onChange`, like a native input, so the parent decides what to do with every change.
- **Logic separate from rendering.** Each behaviour lives in its own hook, and the maths lives in pure functions in `lib/range-utils.ts`. Both can be tested without a browser layout.
- **One coordinate system.** Pointer and keyboard input are turned into a track percentage, then into a value. In normal mode the mapping is linear and rounded to `step`. In fixed mode the percentage maps to an index, so the options are spaced evenly whatever their numeric gap.
- **Handles never cross.** Moving the min handle is capped at the current max, and the other way round. Incoming values are also clamped to the limits.
- **Pointer events with window listeners.** Once a drag starts, `pointermove` and `pointerup` are listened to on `window`, so the drag continues when the pointer leaves the track. Mouse, touch and pen work the same way.
- **Floating-point safety.** Stepped values are rounded to the number of decimals of `step`, so `0.1 + 0.2` style errors never reach the labels.
- **Mocked services as Route Handlers.** The data comes from `app/api/*` and is consumed through `fetch`, as a real API would be.

## Accessibility

- Each handle is focusable and exposes `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and a configurable `aria-label`.
- Arrow keys move the focused handle.
- Editable labels are buttons. Enter confirms, Escape cancels, and validation errors are announced with `role="alert"`.

## Testing

Tests use Vitest and Testing Library in jsdom. They cover:

- the pure helpers (`lib/range-utils.ts`);
- the model and keyboard hooks;
- label editing and validation;
- the `Range` component in both modes (rendering, dragging, track clicks, keyboard);
- `useApiData` (success, HTTP errors, retry, abort on unmount).

```bash
npm run test:coverage
```
