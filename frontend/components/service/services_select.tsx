// all fields of work in case all in one:
const fields = [
  "Air Conditioner",
  "Carpentry",
  "Electricity",
  "Gardening",
  "Home Machines",
  "Housekeeping",
  "Interior Design",
  "Locks",
  "Painting",
  "Plumbing",
  "Water Heaters",
];

// render the jsx for the salect in the case where he user has all in one fields:
export default function Render_fields_options(
  value: string,
  meth: any
): React.JSX.Element {
  const fieldElements: React.JSX.Element[] = []; // This is correct - array of JSX elements
  fieldElements.push(<option>services</option>);
  for (let i = 0; i < fields.length; i++) {
    fieldElements.push(<option value={fields[i]}>{fields[i]}</option>);
  }
  return (
    <select name="field" value={value} onChange={meth}>
      {fieldElements}
    </select>
  );
}
