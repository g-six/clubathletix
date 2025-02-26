import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { PhotoUploader } from '@/components/photo-uploader'
import { Select } from '@/components/select'
import { Text } from '@/components/text'
import { getOrganization } from '@/models/organization'
import type { Metadata } from 'next'
import { saveSettings } from './actions'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function Settings({ params }: { params: Promise<{ organization_id: string }> }) {
  const { organization_id } = await params
  const organization = await getOrganization(organization_id)

  return (
    <form
      className="mx-auto max-w-4xl"
      action={async (evt) => {
        'use server'
        return saveSettings(organization_id, evt)
      }}
    >
      <Heading>Settings</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div className="flex gap-4">
          <Input aria-label="Organization Name" name="name" defaultValue={organization?.name} />
          <Input
            className="sm:!w-1/3 lg:!w-1/4"
            aria-label="Initials"
            name="short_name"
            defaultValue={organization?.short_name}
          />
        </div>
      </section>
      <Divider className="my-10" soft />
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Logo</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div>
          <PhotoUploader name="logo" data-default={organization?.logo || undefined} />
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Bio</Subheading>
          <Text>This will be displayed on your public profile. Maximum 240 characters.</Text>
        </div>
        <div>
          <Textarea aria-label="Organization Bio" name="bio" />
        </div>
      </section>

      <Divider className="my-10" soft /> */}

      <Heading>Contact info</Heading>
      <Divider className="my-10 mt-6" />
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email</Subheading>
          <Text>This is how customers can email you for support.</Text>
        </div>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter a valid email address"
            aria-label="Organization Email"
            name="email"
            defaultValue={organization.email}
          />
          {/* <CheckboxField>
            <Checkbox name="email_is_public" defaultChecked />
            <Label>Show email on public profile</Label>
          </CheckboxField> */}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Contact name</Subheading>
          <Text>Main contact person for the organization.</Text>
        </div>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="First name..."
            aria-label="Contact first name"
            name="contact_first_name"
            defaultValue={organization.contact_first_name}
          />
          <Input
            type="text"
            placeholder="Last name..."
            aria-label="Contact last name"
            name="contact_last_name"
            defaultValue={organization.contact_last_name}
          />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Phone number</Subheading>
          <Text>Business phone number (preferably WhatsApp Business&reg;).</Text>
        </div>
        <div className="space-y-4">
          <Input
            type="tel"
            placeholder="Mobile phone number..."
            aria-label="Mobile phone number"
            name="phone"
            defaultValue={organization.phone}
          />
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Address</Subheading>
          <Text>This is where your organization is registered.</Text>
        </div>
        <Address />
      </section>

      <Divider className="my-10" soft /> */}

      <Heading>Billing information</Heading>
      <Divider className="my-10 mt-6" />
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Currency</Subheading>
          <Text>The currency that your organization will be collecting.</Text>
        </div>
        <div>
          <Select aria-label="Currency" name="currency" defaultValue="cad">
            <option value="cad">CAD - Canadian Dollar</option>
            <option value="usd">USD - United States Dollar</option>
          </Select>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="reset" plain>
          Reset
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
