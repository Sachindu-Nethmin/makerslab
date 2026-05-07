import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { User } from "@/lib/models/User";
import { ObjectId } from "mongodb";
import { BuilderForm } from "@/components/cv-builder/builder-form";

export default async function CVBuilderPage() {
  const session = await auth();

  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    redirect("/login");
  }

  const db = await getDatabase();
  const userId = new ObjectId(session.user.id);

  const user = await db.collection<User>("users").findOne(
    { _id: userId },
    { projection: { name: 1, email: 1, linkedin: 1, github: 1, bio: 1, universityId: 1, createdAt: 1, updatedAt: 1 } }
  );
  
  if (!user) {
    redirect("/login");
  }

  const projects = await db
    .collection<Project>("projects")
    .find(
      { userId: userId },
      { projection: { title: 1, description: 1, category: 1, tags: 1, status: 1, startDate: 1, endDate: 1, githubUrl: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray();

  // Convert ObjectIds and Dates to strings for the client component with explicit allow-list
  const serializedUser = {
    _id: user._id?.toString(),
    name: user.name,
    email: user.email,
    linkedin: user.linkedin || "",
    github: user.github || "",
    bio: user.bio || "",
    universityId: user.universityId?.toString(),
    createdAt: user.createdAt?.toISOString() || null,
    updatedAt: user.updatedAt?.toISOString() || null,
  };

  const serializedProjects = projects.map(p => ({
    _id: p._id?.toString(),
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags,
    status: p.status,
    startDate: p.startDate?.toISOString() || null,
    endDate: p.endDate?.toISOString() || null,
    githubUrl: p.githubUrl || null,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">CV Builder</h1>
          <p className="text-muted-foreground">
            Create a professional CV by selecting your best projects from Makers Lab.
          </p>
        </div>
        <BuilderForm user={serializedUser} projects={serializedProjects} />
      </div>
    </div>
  );
}

