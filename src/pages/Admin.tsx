import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronsUpDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  displacement: number | null;
  cylinders: number | null;
  mpg_city: number | null;
  mpg_highway: number | null;
  mpg_combined: number | null;
  fuel_type: string | null;
  transmission: string | null;
  drive_type: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Vehicle>("make");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 50;

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchVehicles();
      fetchMakes();
    }
  }, [isAdmin, currentPage, sortColumn, sortDirection]);

  const checkAdminAccess = async () => {
    try {
      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("Please log in to access admin panel");
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        toast.error("You don't have admin access");
        navigate("/");
        return;
      }

      if (!roles) {
        toast.error("You don't have admin access");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Access check failed");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("vehicles")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" });

      // Add secondary sorts: Make ASC, Year DESC, Model ASC (skip if already primary sort)
      const secondarySorts: Array<{ col: keyof Vehicle; ascending: boolean }> = [
        { col: "make", ascending: true },
        { col: "year", ascending: false },
        { col: "model", ascending: true }
      ];
      secondarySorts.forEach(({ col, ascending }) => {
        if (col !== sortColumn) {
          query = query.order(col, { ascending });
        }
      });

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setVehicles(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    }
  };

  const fetchMakes = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("make")
        .order("make")
        .limit(100000);

      if (error) throw error;

      const uniqueMakes = Array.from(new Set(data.map(v => v.make))).sort();
      setMakes(uniqueMakes);
    } catch (error) {
      console.error("Error fetching makes:", error);
    }
  };

  const handleSort = (column: keyof Vehicle) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const vehicleData: any = {
      year: parseInt(formData.get("year") as string),
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      mpg_combined: formData.get("mpg")
        ? parseFloat(formData.get("mpg") as string)
        : null,
      fuel_type: formData.get("fuel_type") as string || null,
      displacement: null,
      cylinders: null,
      mpg_city: null,
      mpg_highway: null,
      transmission: null,
      drive_type: null,
    };

    try {
      if (editingVehicle) {
        const { error } = await (supabase as any)
          .from("vehicles")
          .update(vehicleData)
          .eq("id", editingVehicle.id);

        if (error) throw error;
        toast.success("Vehicle updated successfully");
        setIsEditDialogOpen(false);
      } else {
        const { error } = await (supabase as any).from("vehicles").insert(vehicleData);

        if (error) throw error;
        toast.success("Vehicle added successfully");
        setIsAddDialogOpen(false);
      }

      fetchVehicles();
      setEditingVehicle(null);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error("Failed to save vehicle");
    }
  };

  const VehicleForm = ({ vehicle }: { vehicle?: Vehicle }) => {
    const [open, setOpen] = useState(false);
    const [selectedMake, setSelectedMake] = useState(vehicle?.make || "");
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const years = Array.from({ length: nextYear - 2010 + 1 }, (_, i) => nextYear - i);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Select name="year" defaultValue={vehicle?.year?.toString() || nextYear.toString()} required>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <input type="hidden" name="make" value={selectedMake} required />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedMake || "Select make..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search make..." />
                  <CommandList>
                    <CommandEmpty>No make found.</CommandEmpty>
                    <CommandGroup>
                      {makes.map((make) => (
                        <CommandItem
                          key={make}
                          value={make}
                          onSelect={(currentValue) => {
                            setSelectedMake(currentValue === selectedMake ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMake === make ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {make}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input id="model" name="model" defaultValue={vehicle?.model} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mpg">MPG</Label>
            <Input
              id="mpg"
              name="mpg"
              type="number"
              step="0.1"
              defaultValue={vehicle?.mpg_combined || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel Type</Label>
            <Input
              id="fuel_type"
              name="fuel_type"
              defaultValue={vehicle?.fuel_type || ""}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit">
            {vehicle ? "Update Vehicle" : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Vehicle Management</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter the vehicle details below
                </DialogDescription>
              </DialogHeader>
              <VehicleForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("year")}
                    className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Year
                    {sortColumn === "year" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortColumn !== "year" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("make")}
                    className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Make
                    {sortColumn === "make" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortColumn !== "make" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("model")}
                    className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Model
                    {sortColumn === "model" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortColumn !== "model" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("mpg_combined")}
                    className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    MPG Combined
                    {sortColumn === "mpg_combined" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortColumn !== "mpg_combined" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("fuel_type")}
                    className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Fuel Type
                    {sortColumn === "fuel_type" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortColumn !== "fuel_type" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.mpg_combined || "N/A"}</TableCell>
                  <TableCell>{vehicle.fuel_type || "N/A"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog
                      open={isEditDialogOpen && editingVehicle?.id === vehicle.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingVehicle(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingVehicle(vehicle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Vehicle</DialogTitle>
                          <DialogDescription>
                            Update the vehicle details below
                          </DialogDescription>
                        </DialogHeader>
                        <VehicleForm vehicle={vehicle} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {vehicles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} vehicles
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
