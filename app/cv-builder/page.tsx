import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { User } from "@/lib/models/User";
import { ObjectId } from "mongodb";
import { BuilderForm } from "@/components/cv-builder/builder-form";

export default async function CVBuilderPage() {
  const session = await auth();
  console.log("CV Builder Page: Checking session...", session?.user?.email);

  if (!session?.user) {
    console.log("CV Builder Page: No session, redirecting to login");
    redirect("/login");
  }

  const db = await getDatabase();
  const userId = new ObjectId(session.user.id);
  console.log("CV Builder Page: Looking for user in DB with ID:", session.user.id);

  const user = await db.collection<User>("users").findOne({ _id: userId });
  
  if (!user) {
    console.log("CV Builder Page: User not found in DB, redirecting to login");
    redirect("/login");
  }

  const projects = await db
    .collection<Project>("projects")
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Convert ObjectIds and Dates to strings for the client component
  const serializedUser = {
    ...user,
    _id: user._id?.toString(),
    universityId: user.universityId?.toString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const serializedProjects = projects.map(p => ({
    ...p,
    _id: p._id?.toString(),
    userId: p.userId.toString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    startDate: p.startDate?.toISOString(),
    endDate: p.endDate?.toISOString(),
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
