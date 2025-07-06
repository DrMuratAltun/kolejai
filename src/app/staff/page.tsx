
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Linkedin, Mail, Users } from "lucide-react";
import Link from "next/link";
import { getStaffMembers, StaffMember } from "@/services/staffService";

// Helper function to build the hierarchy
const buildHierarchy = (staff: StaffMember[]) => {
  const staffMap = new Map<string, StaffMember & { children: StaffMember[] }>();
  
  staff.forEach(s => {
    staffMap.set(s.id, { ...s, children: [] });
  });

  const managers: (StaffMember & { children: StaffMember[] })[] = [];
  const rootStaff: StaffMember[] = [];

  staff.forEach(s => {
    if (s.parentId && staffMap.has(s.parentId)) {
        const parent = staffMap.get(s.parentId);
        if (parent) {
            parent.children.push(staffMap.get(s.id)!);
        }
    } else {
      rootStaff.push(s);
    }
  });

  staffMap.forEach(s => {
      if (s.children.length > 0) {
          managers.push(s);
      }
  });

  return { managers, rootStaff };
};

const groupRootStaffByDepartment = (staff: StaffMember[]) => {
    return staff.reduce((acc, member) => {
        const department = member.department || "Diğer";
        if (!acc[department]) {
            acc[department] = [];
        }
        acc[department].push(member);
        return acc;
    }, {} as Record<string, StaffMember[]>);
}

function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg group transform transition-transform duration-300 hover:-translate-y-2 h-full">
      <Image
        src={member.photo}
        alt={member.name}
        width={400}
        height={400}
        className="w-full h-full object-cover"
        data-ai-hint={member.aiHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold">{member.name}</h3>
        <p className="text-primary-foreground/80">{member.title}</p>
      </div>
      <div className="absolute inset-0 bg-blue-800/90 flex flex-col justify-end p-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-xl font-bold mb-2">{member.name}</h3>
        <p className="text-blue-200 mb-4">{member.title}</p>
        <p className="text-sm mb-4 line-clamp-3">{member.description}</p>
        <div className="flex space-x-3 mt-auto">
          <Link href="#" className="text-white hover:text-blue-300"><Linkedin /></Link>
          <Link href="#" className="text-white hover:text-blue-300"><Mail /></Link>
        </div>
      </div>
    </div>
  );
}

export default async function StaffPage() {
  const allStaff = await getStaffMembers();
  const { managers, rootStaff } = buildHierarchy(allStaff);
  const nonHierarchicalGroups = groupRootStaffByDepartment(rootStaff.filter(rs => !managers.find(m => m.id === rs.id)));

  return (
    <div className="container mx-auto px-4 pb-16 pt-28 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Eğitim Kadromuz</h1>
        <div className="w-20 h-1 bg-primary mx-auto"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Alanında uzman, deneyimli ve yenilikçi eğitimcilerden oluşan dinamik kadromuz.</p>
      </div>

      {allStaff.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p>Şu anda gösterilecek personel bulunmamaktadır.</p>
          <p>Lütfen admin panelinden personel ekleyiniz.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Hierarchical Groups */}
          {managers.map(manager => (
            <section key={manager.id}>
              <h2 className="text-2xl font-bold text-center mb-4">{manager.title}</h2>
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-xs">
                  <StaffCard member={manager} />
                </div>
              </div>
              
              {manager.children.length > 0 && (
                <>
                  <div className="flex items-center justify-center text-center my-4">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink mx-4 text-muted-foreground font-semibold flex items-center gap-2"><Users className="h-5 w-5"/> Ekip</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {manager.children.map(child => (
                      <StaffCard key={child.id} member={child} />
                    ))}
                  </div>
                </>
              )}
            </section>
          ))}

          {/* Non-Hierarchical Groups */}
          {Object.entries(nonHierarchicalGroups).map(([department, members]) => (
             <section key={department}>
                <h2 className="text-2xl font-bold text-center mb-8">{department}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {members.map(member => (
                       <StaffCard key={member.id} member={member} />
                    ))}
                </div>
             </section>
          ))}
        </div>
      )}
    </div>
  );
}
