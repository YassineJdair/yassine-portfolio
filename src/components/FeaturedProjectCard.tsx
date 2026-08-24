import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FeaturedProject } from "@/data/featuredProjects";
import { ExternalLink, ImageOff, Layers, Lock } from "lucide-react";

const FeaturedProjectCard = ({ title, subtitle, description, stack, scale, highlight, liveUrl, private: isPrivate, image }: FeaturedProject) => {
    return (
        <Card className="h-full bg-card/50 border-border/50 hover:border-primary/50 transition-colors overflow-hidden">
            {/* Screenshot / GIF placeholder */}
            <div className="aspect-video bg-accent/20 border-b border-border/50 flex items-center justify-center">
                {image ? (
                    <img src={image} alt={`${title} screenshot`} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60">
                        <ImageOff className="h-6 w-6" />
                        <span className="text-xs">Screenshot coming soon</span>
                    </div>
                )}
            </div>

            <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-primary uppercase tracking-wide font-medium">{subtitle}</p>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{description}</p>

                <div className="flex flex-wrap gap-1.5">
                    {stack.map((tech) => (
                        <span key={tech} className="bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full text-xs">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{scale}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
                    {highlight}
                </p>

                <div className="pt-1">
                    {liveUrl ? (
                        <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                            View Live <ExternalLink className="h-4 w-4" />
                        </a>
                    ) : isPrivate ? (
                        <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" /> Private — login-gated, no public link
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-sm">Live link coming soon</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FeaturedProjectCard;
