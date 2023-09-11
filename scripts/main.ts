/// Casting as any because TypeScript sucks at HTML/SVG
const dataForm = document.getElementById("data") as any;
const singletPath = document.getElementById("path-singlet") as any;

const dataInputs = dataForm.elements as { [key: string]: HTMLInputElement };

function parseMaybeInf(value: string): number {
  if ("infinity".startsWith(value.toLowerCase())) return Infinity;
  else if ("-infinity".startsWith(value.toLowerCase())) return -Infinity;
  return parseFloat(value);
}

function singletPower(no: number, nl: number, ni: number, r1: number, r2: number, d1: number): number {
  const p1 = (nl - no) / r1;
  const p2 = (ni - nl) / r2;

  return p1 + p2 - p1 * p2 * d1 / nl;
}

function curve(radius: number, invert: boolean): string {
  if (isFinite(radius) && isFinite(1 / radius)) {
    if (radius > 0) {
      return invert ? "a 5 5 180 0 1 0 -3" : "a 5 5 180 0 0 0 3";
    }
    return invert ? "a 5 5 180 0 0 0 -3" : "a 5 5 180 0 1 0 3";
  }
  return invert ? "v -3" : "v 3"
}

function calc({ unknown, i, o, f }: { unknown: string, i: number, o: number, f: number }): { i: number, o: number, f: number, p: number } {
  let p = 0;

  if (unknown === "f") {
    if (!isFinite(i) && !isFinite(o)) {
      if (i === o) {
        p = i;
      } else {
        p = 0;
      }
    } else if (!isFinite(i)) {
      p = 1;
    } else if (!isFinite(o)) {
      p = -1;
    } else {
      p = (i + o) / (i - o);
    }

    f = 1 / (1 / i + 1 / o);

    return { i, o, f, p };
  } else if (unknown == "i") {
    return calc({ unknown: "f", i: 1 / (1 / f - 1 / o), o, f });
  }

  return calc({ unknown: "f", i, o: 1 / (1 / f - 1 / i), f });
}

function updateForm(values, unknown: string) {
  for (const name in values) {
    dataInputs[name].value = values[name];
  }

  document.querySelectorAll("input[type=radio]+input").forEach((element) => {
    (element as HTMLInputElement).disabled = (element.previousElementSibling as HTMLInputElement).checked;
  });
}

function update() {
  const n = dataInputs.n.valueAsNumber;

  let unknown = dataInputs.unknown.value;
  const { i, o, f, p } = calc({ unknown, i: parseMaybeInf(dataInputs.i.value), o: parseMaybeInf(dataInputs.o.value), f: parseMaybeInf(dataInputs.f.value) });

  const c = -2 * p * (n * n - 1) / (n + 2);
  const r1 = 2 * f * (n - 1) / (c + 1);
  const r2 = 2 * f * (n - 1) / (c - 1);

  updateForm({ i, o, f, p, c, r1, r2 }, unknown);
}

dataForm.addEventListener("input", update);
update();
