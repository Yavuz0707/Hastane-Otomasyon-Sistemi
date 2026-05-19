import { createUserAction } from "@/app/actions";
import { Card, Field, PageHeader, Select } from "@/components/ui";
import { roleLabels } from "@/lib/labels";

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Kullanıcı" description="Rol bazlı kullanıcı hesabı oluşturun." />
      <Card>
        <form action={createUserAction} className="grid gap-4 md:grid-cols-2">
          <Field label="Ad" name="name" />
          <Field label="Soyad" name="surname" />
          <Field label="E-posta" name="email" type="email" />
          <Field label="Şifre" name="password" type="password" />
          <Select label="Rol" name="role">
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Kullanıcı Oluştur</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
