import Layout from '@/components/Layout';
import { Briefcase, Calendar } from 'lucide-react';

const Experience = () => {
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-12">Experience</h1>
          
          <div className="space-y-12">

            {/* Blocworx */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">03/2025 - Present</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Blocworx</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Software Implementation Engineer</span>
              </div>
              <p className="text-muted-foreground mb-4">
                I implemented and configured custom digital workflows using the Blocworx no-code platform, helping clients streamline their processes while minimizing the need to write code.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Python</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">REST API</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">JSON</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">JS</span>
              </div>
            </div>

                      {/* Maison D’Oud */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">10/2024 - Present</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Maison D’Oud</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Co-Founder</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Founded a luxury fragrance brand and led branding, product development, marketing, and e-commerce strategy to build a premium customer experience.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Branding</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Marketing</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">E-Commerce</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Content Creation</span>
              </div>
            </div>

            {/* AutoLabs */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">04/2022 - Present</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">AutoLabs</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Co-Founder</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Managed automotive customization services including wraps, lighting, and PPF; handled customer service, inventory, and social media to grow the business.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Wraps</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">PPF</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Customer Experience</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Social Media</span>
              </div>
            </div>

            {/* DP Car Detailing */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">06/2021 - 03/2025</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">DP Car Detailing</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Manager</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Oversaw operations, inventory, and team management while delivering high-end detailing services and custom vehicle enhancements.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Detailing</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Leadership</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Inventory</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Customisation</span>
              </div>
            </div>

            {/* Great National Hotels */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">08/2023 - 06/2024</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Great National Hotels and Resorts</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Reservations Agent</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Handled reservations, upselling, and technical assistance while maintaining high accuracy and providing outstanding guest support.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Customer Service</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Sales</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Upselling</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Troubleshooting</span>
              </div>
            </div>

            {/* Apple */}
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">06/2022 - 05/2023</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Apple</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">AppleCare Advisor</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Delivered technical support for Apple products remotely, resolving software, hardware, and connectivity issues with precision and care.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Apple Support</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">iOS</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Troubleshooting</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Remote Support</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Experience;
