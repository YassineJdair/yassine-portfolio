import Layout from '@/components/Layout';
import { Briefcase, Calendar } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const experiences = [
    {
        company: "Dell Technologies",
        role: "Service Delivery Engineer 2",
        period: "05/2026 - Present",
        current: true,
        description: "Managing the services backlog across the EMEA supply chain with Global Operations, Engineering, IT and Enablement teams, and building the software that removes manual work from it.",
        highlights: [
            "Built an order-tracking dashboard that searches five internal fulfilment systems at once (Python, Playwright, JavaScript), handling OAuth2/JWT and legacy sign-ins, and rolled it out to the team with setup docs.",
            "Built a Python pipeline handling ~10,000 orders a day through an internal OAuth2 API with batched, retried calls, cutting a daily dashboard refresh from ~25 minutes to ~3.",
            "Designed a self-service order-validation restart tool with a dry-run mode, cutting bulk revalidation of 8,000+ orders from an estimated 3-4 hours to ~15 minutes.",
            "Built a Python/pandas pipeline that turns the raw global backlog export into a clean Excel report for Power BI, adding live order statuses from internal REST APIs.",
            "Built a six-page Power BI backlog report covering customers, holds, facilities and defects, fed by a daily Excel/VBA workbook.",
            "Built more than a dozen Python, PowerShell and VBA reporting tools with test modes, retries and fail-fast steps, so live reports don't refresh from bad data.",
            "Automated daily manual work, including report pulls (~60-80 minutes to one ~5-minute script), UPS tracking emails (~10 minutes to ~2) and a legacy macro (~15 minutes to ~2).",
        ],
        tags: ["Python", "Playwright", "pandas", "Power BI", "PowerShell", "VBA", "OAuth2", "REST APIs", "Automation", "Supply Chain"],
    },
    {
        company: "Blocworx",
        role: "Systems Support & Software Implementation Engineer",
        period: "03/2025 - 05/2026",
        current: false,
        description: "Implemented and configured custom digital workflows using the Blocworx no code platform, helping clients streamline their processes. Developed custom scripts and logic to extend system functionality and delivered user training and documentation for successful deployments.",
        tags: ["Python", "REST API", "JSON", "JS", "Workflow Automation"],
    },
    {
        company: "Maison D'Oud",
        role: "Co-Founder",
        period: "10/2024 - Present",
        current: true,
        description: "Founded a luxury fragrance brand and led branding, product development, marketing, and e-commerce strategy to build a premium customer experience.",
        tags: ["Branding", "Marketing", "E-Commerce", "Content Creation"],
    },
    {
        company: "AutoLabs",
        role: "Co-Founder",
        period: "04/2022 - Present",
        current: true,
        description: "Managed automotive customization services including wraps, lighting, and PPF. Handled customer service, inventory, and social media to grow the business.",
        tags: ["Wraps", "PPF", "Customer Experience", "Social Media"],
    },
    {
        company: "HydroSolutions",
        role: "Co-Founder",
        period: "08/2026 - Present",
        current: true,
        description: "Co-founded a mobile car detailing and window cleaning business, handling service delivery, customer bookings, and growth strategy.",
        tags: ["Mobile Detailing", "Window Cleaning", "Customer Service", "Business Growth"],
    },
    {
        company: "DP Car Detailing",
        role: "Manager",
        period: "06/2021 - 03/2025",
        current: false,
        description: "Oversaw operations, inventory, and team management while delivering high end detailing services and custom vehicle enhancements.",
        tags: ["Detailing", "Leadership", "Inventory", "Customisation"],
    },
    {
        company: "Great National Hotels and Resorts",
        role: "Reservations Agent",
        period: "08/2023 - 06/2024",
        current: false,
        description: "Handled reservations, upselling, and technical assistance while maintaining high accuracy and providing outstanding guest support.",
        tags: ["Customer Service", "Sales", "Upselling", "Troubleshooting"],
    },
    {
        company: "Apple",
        role: "AppleCare Advisor",
        period: "06/2022 - 05/2023",
        current: false,
        description: "Delivered technical support for Apple products remotely, resolving software, hardware, and connectivity issues with precision and care.",
        tags: ["Apple Support", "iOS", "Troubleshooting", "Remote Support"],
    },
];

const Experience = () => {
    useSEO(
        "Experience – Yassine Jdair",
        "Professional experience of Yassine Jdair, Service Delivery Engineer 2 at Dell Technologies in Limerick, building Python automation, dashboards and reporting tools.",
        "/experience"
    );

    return (
        <Layout>
            <div className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-center mb-12">Experience</h1>

                    <div className="space-y-12">
                        {experiences.map((exp) => (
                            <div key={exp.company + exp.role} className="relative border-l border-primary/50 pl-8 pb-2">
                                <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0" />

                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">{exp.period}</span>
                                    {exp.current && (
                                        <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                      Current
                    </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold mb-1">{exp.company}</h2>

                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="text-sm">{exp.role}</span>
                                </div>

                                <p className="text-muted-foreground mb-4">{exp.description}</p>

                                {exp.highlights && (
                                    <ul className="list-disc list-outside pl-5 space-y-1.5 mb-4 text-muted-foreground text-sm">
                                        {exp.highlights.map((highlight) => (
                                            <li key={highlight}>{highlight}</li>
                                        ))}
                                    </ul>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {exp.tags.map((tag) => (
                                        <span key={tag} className="bg-accent/30 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Experience;