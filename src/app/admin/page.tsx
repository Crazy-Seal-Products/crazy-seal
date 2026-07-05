import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import { Users, Eye, MousePointerClick, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="lg">
          <div>
            <Heading level={1} className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </Heading>
            <Text className="text-gray-500">RV Armor Admin Panel</Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/leads">
              <Card variant="elevated" className="p-6 hover:border-[#003365] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#003365]" />
                  </div>
                  <div>
                    <Text className="text-sm text-gray-500">Leads</Text>
                    <Text className="text-xl font-bold text-gray-900">View All</Text>
                  </div>
                </div>
              </Card>
            </Link>

            <Card variant="elevated" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Sessions</Text>
                  <Text className="text-xl font-bold text-gray-900">--</Text>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MousePointerClick className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Conversions</Text>
                  <Text className="text-xl font-bold text-gray-900">--</Text>
                </div>
              </div>
            </Card>

            <Link href="/admin/assets">
              <Card variant="elevated" className="p-6 hover:border-[#003365] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-[#5BA411]" />
                  </div>
                  <div>
                    <Text className="text-sm text-gray-500">Site Assets</Text>
                    <Text className="text-xl font-bold text-gray-900">Manage</Text>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </Stack>
      </Container>
    </div>
  )
}
