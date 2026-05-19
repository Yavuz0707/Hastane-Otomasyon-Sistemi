import { createPatientAction } from "@/app/actions";
import { Card, Field, PageHeader, Select } from "@/components/ui";
import { genderLabels } from "@/lib/labels";

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hasta Kayıt Formu" description="Kimlik, iletişim ve temel hasta bilgilerini girin." />
      <Card>
        <form action={createPatientAction} className="grid gap-4 md:grid-cols-2">
          <Field label="TC Kimlik No" name="nationalId" />
          <Field label="Ad" name="firstName" />
          <Field label="Soyad" name="lastName" />
          <Field label="Doğum Tarihi" name="birthDate" type="date" />
          <Select label="Cinsiyet" name="gender">{Object.entries(genderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Field label="Telefon" name="phone" />
          <Field label="E-posta" name="email" type="email" />
          <Field label="Kan Grubu" name="bloodGroup" required={false} />
          <div className="md:col-span-2"><Field label="Adres" name="address" /></div>
          <div className="md:col-span-2"><button className="btn-primary" type="submit">Hasta Kaydet</button></div>
        </form>
      </Card>
    </div>
  );
}
