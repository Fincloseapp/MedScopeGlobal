"use client";

import type { ReactNode } from "react";
import {
  ANAMNESIS_CONSENT_TEXT,
  ANAMNESIS_LABELS,
  ANAMNESIS_SECTION_HEADINGS,
  OA_CHRONIC_FIELDS,
  renderAnamnesisReport,
  showGynecologicSection,
  type AnamnesisRecord,
  type YesNoUnknown,
} from "@/lib/lekari/dokumentace/anamnesis";

type Props = {
  value: AnamnesisRecord;
  onChange: (next: AnamnesisRecord) => void;
  disabled?: boolean;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-[#cfe1f3] bg-[#f8fbfe] p-3 sm:p-4">
      <legend className="px-1 font-display text-sm font-semibold text-[#005B96]">
        {title}
      </legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block text-xs text-slate-600 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-[#021d33]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-[#021d33]";
const areaClass =
  "min-h-[72px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-[#021d33]";

function YnSelect({
  value,
  onChange,
  disabled,
}: {
  value: YesNoUnknown;
  onChange: (v: YesNoUnknown) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className={inputClass}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as YesNoUnknown)}
    >
      <option value="">neuvedeno</option>
      <option value="ano">ano</option>
      <option value="ne">ne</option>
    </select>
  );
}

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#021d33]">
      <input
        type="checkbox"
        className="h-4 w-4 accent-[#005B96]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function AnamnesisIntakeForm({ value, onChange, disabled }: Props) {
  const patch = (partial: (draft: AnamnesisRecord) => void) => {
    const next = structuredClone(value);
    partial(next);
    onChange(next);
  };

  const showGa = showGynecologicSection(value);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-slate-500">
        Anamnestický dotazník pro dospělé. Zkratky: NO, OA, RA, FA, AA, TA, PA/SA, GA.
        Nahrávka se mapuje do těchto polí. Prázdné = neuvedeno — nic se nedomýšlí.
      </p>

      <Section title={ANAMNESIS_SECTION_HEADINGS[0]}>
        <Field label="Jméno a příjmení">
          <input
            className={inputClass}
            value={value.identification.name}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.name = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Datum narození">
          <input
            className={inputClass}
            placeholder="RRRR-MM-DD"
            value={value.identification.dateOfBirth}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.dateOfBirth = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Rodné číslo">
          <input
            className={inputClass}
            value={value.identification.birthNumber}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.birthNumber = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Pojišťovna">
          <input
            className={inputClass}
            value={value.identification.insurer}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.insurer = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Telefon">
          <input
            className={inputClass}
            value={value.identification.phone}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.phone = e.target.value;
              })
            }
          />
        </Field>
        <Field label="E-mail">
          <input
            className={inputClass}
            type="email"
            value={value.identification.email}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.email = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Pohlaví">
          <select
            className={inputClass}
            value={value.identification.sex}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.identification.sex = e.target.value as AnamnesisRecord["identification"]["sex"];
                if (e.target.value === "zena") d.gynecologic.applicable = true;
              })
            }
          >
            <option value="">neuvedeno</option>
            <option value="zena">žena</option>
            <option value="muz">muž</option>
          </select>
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[1]}>
        <Field label={ANAMNESIS_LABELS.chiefComplaint} wide>
          <textarea
            className={areaClass}
            value={value.presentIllness.chiefComplaint}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.presentIllness.chiefComplaint = e.target.value;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.durationCourse} wide>
          <textarea
            className={areaClass}
            value={value.presentIllness.durationCourse}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.presentIllness.durationCourse = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Vyšetření u jiného specialisty" wide>
          <input
            className={inputClass}
            value={value.presentIllness.priorSpecialist}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.presentIllness.priorSpecialist = e.target.value;
              })
            }
          />
        </Field>
        {value.presentIllness.unmapped ? (
          <Field label="Další údaje (nezařazené)" wide>
            <textarea
              className={areaClass}
              value={value.presentIllness.unmapped}
              disabled={disabled}
              onChange={(e) =>
                patch((d) => {
                  d.presentIllness.unmapped = e.target.value;
                })
              }
            />
          </Field>
        ) : null}
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[2]}>
        {OA_CHRONIC_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <YnSelect
              value={value.personalHistory[f.key]}
              disabled={disabled}
              onChange={(v) =>
                patch((d) => {
                  d.personalHistory[f.key] = v;
                })
              }
            />
          </Field>
        ))}
        <Field label="Jiné chronické choroby" wide>
          <input
            className={inputClass}
            value={value.personalHistory.otherChronic}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.personalHistory.otherChronic = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Operace a úrazy (s rokem)" wide>
          <textarea
            className={areaClass}
            value={value.personalHistory.surgeriesTrauma}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.personalHistory.surgeriesTrauma = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Hospitalizace" wide>
          <textarea
            className={areaClass}
            value={value.personalHistory.hospitalizations}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.personalHistory.hospitalizations = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[3]}>
        <Field label={ANAMNESIS_LABELS.miStroke}>
          <YnSelect
            value={value.familyHistory.miStrokeUnder50}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.miStrokeUnder50 = v;
              })
            }
          />
        </Field>
        <Field label="Zhoubné nádory">
          <YnSelect
            value={value.familyHistory.cancer}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.cancer = v;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.dmHtn}>
          <YnSelect
            value={value.familyHistory.dmHtn}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.dmHtn = v;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.otherHereditary} wide>
          <input
            className={inputClass}
            value={value.familyHistory.otherHereditary}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.familyHistory.otherHereditary = e.target.value;
              })
            }
          />
        </Field>
        <div className="sm:col-span-2 flex flex-wrap gap-4">
          <Check
            label="matka"
            checked={value.familyHistory.mother}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.mother = v;
              })
            }
          />
          <Check
            label="otec"
            checked={value.familyHistory.father}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.father = v;
              })
            }
          />
          <Check
            label="sourozenec"
            checked={value.familyHistory.sibling}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.familyHistory.sibling = v;
              })
            }
          />
        </div>
        <Field label={`${ANAMNESIS_LABELS.relative} (upřesnění)`} wide>
          <input
            className={inputClass}
            value={value.familyHistory.whoDetail}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.familyHistory.whoDetail = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[4]}>
        <Field label={`${ANAMNESIS_LABELS.prescription}, např. Agen 5 mg 1-0-0`} wide>
          <textarea
            className={areaClass}
            value={value.pharmacologic.prescription}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.pharmacologic.prescription = e.target.value;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.otc} wide>
          <textarea
            className={areaClass}
            value={value.pharmacologic.otcSupplements}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.pharmacologic.otcSupplements = e.target.value;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.hakHrt} wide>
          <input
            className={inputClass}
            value={value.pharmacologic.hakHrt}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.pharmacologic.hakHrt = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[5]}>
        <Field label={ANAMNESIS_LABELS.drugAllergies} wide>
          <textarea
            className={areaClass}
            value={value.allergies.drugsAbIodineAnesthetics}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.allergies.drugsAbIodineAnesthetics = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Jiné alergie" wide>
          <input
            className={inputClass}
            value={value.allergies.otherAllergies}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.allergies.otherAllergies = e.target.value;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.diet} wide>
          <input
            className={inputClass}
            value={value.allergies.dietIntolerances}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.allergies.dietIntolerances = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[6]}>
        <Field label="Kouření">
          <input
            className={inputClass}
            value={value.toxicology.smoking}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.toxicology.smoking = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Alkohol">
          <input
            className={inputClass}
            value={value.toxicology.alcohol}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.toxicology.alcohol = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Kofein">
          <input
            className={inputClass}
            value={value.toxicology.caffeine}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.toxicology.caffeine = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title={ANAMNESIS_SECTION_HEADINGS[7]}>
        <Field label="Profese" wide>
          <input
            className={inputClass}
            value={value.socialOccupational.occupation}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.socialOccupational.occupation = e.target.value;
              })
            }
          />
        </Field>
        <div className="sm:col-span-2 flex flex-wrap gap-4">
          <Check
            label={ANAMNESIS_LABELS.workSedentary}
            checked={value.socialOccupational.sedentary}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.socialOccupational.sedentary = v;
              })
            }
          />
          <Check
            label={ANAMNESIS_LABELS.workPhysical}
            checked={value.socialOccupational.physical}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.socialOccupational.physical = v;
              })
            }
          />
          <Check
            label={ANAMNESIS_LABELS.workStress}
            checked={value.socialOccupational.stress}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.socialOccupational.stress = v;
              })
            }
          />
          <Check
            label={ANAMNESIS_LABELS.workShift}
            checked={value.socialOccupational.shift}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.socialOccupational.shift = v;
              })
            }
          />
        </div>
        <Field label="Charakter práce (upřesnění)" wide>
          <input
            className={inputClass}
            value={value.socialOccupational.workTypeNote}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.socialOccupational.workTypeNote = e.target.value;
              })
            }
          />
        </Field>
        <Field label={ANAMNESIS_LABELS.living} wide>
          <input
            className={inputClass}
            value={value.socialOccupational.livingSituation}
            disabled={disabled}
            onChange={(e) =>
              patch((d) => {
                d.socialOccupational.livingSituation = e.target.value;
              })
            }
          />
        </Field>
      </Section>

      {showGa ? (
        <Section title={ANAMNESIS_SECTION_HEADINGS[8]}>
          <div className="sm:col-span-2">
            <Check
              label="Vyplnit gynekologickou anamnézu (ženy)"
              checked={value.gynecologic.applicable || value.identification.sex === "zena"}
              disabled={disabled}
              onChange={(v) =>
                patch((d) => {
                  d.gynecologic.applicable = v;
                })
              }
            />
          </div>
          <Field label="Porody">
            <input
              className={inputClass}
              value={value.gynecologic.births}
              disabled={disabled}
              onChange={(e) =>
                patch((d) => {
                  d.gynecologic.births = e.target.value;
                  d.gynecologic.applicable = true;
                })
              }
            />
          </Field>
          <Field label="Potraty">
            <input
              className={inputClass}
              value={value.gynecologic.miscarriages}
              disabled={disabled}
              onChange={(e) =>
                patch((d) => {
                  d.gynecologic.miscarriages = e.target.value;
                  d.gynecologic.applicable = true;
                })
              }
            />
          </Field>
          <Field label="Poslední menstruace (LMP) / menopauza" wide>
            <input
              className={inputClass}
              value={value.gynecologic.lmpMenopause}
              disabled={disabled}
              onChange={(e) =>
                patch((d) => {
                  d.gynecologic.lmpMenopause = e.target.value;
                  d.gynecologic.applicable = true;
                })
              }
            />
          </Field>
          <Field label={ANAMNESIS_LABELS.pregnancy} wide>
            <input
              className={inputClass}
              value={value.gynecologic.pregnancy}
              disabled={disabled}
              onChange={(e) =>
                patch((d) => {
                  d.gynecologic.pregnancy = e.target.value;
                  d.gynecologic.applicable = true;
                })
              }
            />
          </Field>
        </Section>
      ) : (
        <p className="text-xs text-slate-500">
          Gynekologická anamnéza (GA) se u mužů nezobrazuje.
        </p>
      )}

      <Section title={ANAMNESIS_SECTION_HEADINGS[9]}>
        <p className="sm:col-span-2 text-xs leading-5 text-slate-600">
          {value.consent.text || ANAMNESIS_CONSENT_TEXT}
        </p>
        <div className="sm:col-span-2">
          <Check
            label="Souhlas se zpracováním údajů zaznamenán"
            checked={value.consent.acknowledged}
            disabled={disabled}
            onChange={(v) =>
              patch((d) => {
                d.consent.acknowledged = v;
                if (!d.consent.text.trim()) d.consent.text = ANAMNESIS_CONSENT_TEXT;
              })
            }
          />
        </div>
      </Section>

      <details className="rounded-xl border border-[#cfe1f3] bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#021d33]">
          Náhled tisku / výstupu
        </summary>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#021d33]">
          {renderAnamnesisReport(value)}
        </pre>
      </details>
    </div>
  );
}
