import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/Logo.png";
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  // Navigation page state
  const [page, setPage] = useState("dashboard"); // dashboard, products, users, logs
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Queries
  const currentUser = useQuery(api.users.viewer);
  const products = useQuery(api.products.getProducts);
  const companies = useQuery(api.products.getCompanies);
  const totalStock = useQuery(api.products.getTotalSupply);
  const sales = useQuery(api.sales.getSales);

  // Conditionally fetch admin-only data
  const isAdmin = currentUser?.role === "admin";
  const allUsers = useQuery(api.users.getAllUsers, isAdmin ? {} : "skip");
  const activityLogs = useQuery(api.actionLogs.getLogs, isAdmin ? {} : "skip");

  // Mutations
  const createProductMut = useMutation(api.products.createProduct);
  const updateProductMut = useMutation(api.products.updateProduct);
  const deleteProductMut = useMutation(api.products.deleteProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const createUserMut = useMutation(api.users.createUser);
  const updateUserMut = useMutation(api.users.updateUser);
  const deleteUserMut = useMutation(api.users.deleteUser);
  const createSaleMut = useMutation(api.sales.createSale);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [userSearch, setUserSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showNewCompanyInput, setShowNewCompanyInput] = useState(false);
  const [showNewProductNameInput, setShowNewProductNameInput] = useState(false);
  
  const [prodForm, setProdForm] = useState<{
    company: string;
    productName: string;
    flavor: string;
    description: string;
    stock: number;
    price: number;
    imageUrl: string;
    storageId: string;
  }>({
    company: "",
    productName: "",
    flavor: "",
    description: "",
    stock: 0,
    price: 0,
    imageUrl: "",
    storageId: "",
  });

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "employee" as "employee" | "admin",
    userStatus: "active" as "active" | "inactive" | "pending",
  });

  // Sale Order Modal State
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [salesFilter, setSalesFilter] = useState<"month" | "year">("month");
  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: 1,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const showToast = (title: string, icon: "success" | "error") => {
    MySwal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      title,
      icon,
      background: "#0d121e",
      color: "#f3f4f6",
      customClass: {
        popup: "border border-slate-800 rounded-xl backdrop-blur-md",
      },
    });
  };

  const confirmDelete = async (title: string, text: string) => {
    const result = await MySwal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#0d121e",
      color: "#f3f4f6",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "px-5 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold rounded-xl mr-3 text-sm cursor-pointer shadow-lg shadow-red-600/10",
        cancelButton:
          "px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 font-semibold rounded-xl text-sm cursor-pointer",
        popup:
          "border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md",
      },
    });
    return result.isConfirmed;
  };

  // Open product modal
  const openProductModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProdForm({
        company: product.company,
        productName: product.productName,
        flavor: product.flavor,
        description: product.description,
        stock: product.stock,
        price: product.price,
        imageUrl: product.imageUrl || "",
        storageId: product.storageId || "",
      });
      setImagePreview(product.imageUrl || null);

      // Determine if company and product name are in the list of existing ones
      const hasCompany = companies?.includes(product.company) ?? false;
      const companyProds = products?.filter((p: any) => p.company === product.company) || [];
      const prodNames = companyProds.map((p: any) => p.productName);
      const hasProductName = prodNames.includes(product.productName);

      setShowNewCompanyInput(!hasCompany);
      setShowNewProductNameInput(!hasProductName);
    } else {
      setEditingProduct(null);
      setProdForm({
        company: "",
        productName: "",
        flavor: "",
        description: "",
        stock: 0,
        price: 0,
        imageUrl: "",
        storageId: "",
      });
      setImagePreview(null);
      setShowNewCompanyInput(false);
      setShowNewProductNameInput(false);
    }
    setIsProductModalOpen(true);
  };

  // Handle image upload from file input
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    try {
      setIsUploadingImage(true);
      const postUrl = await generateUploadUrl();
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image file to storage.");
      }

      const { storageId } = await response.json();
      setProdForm((prev) => ({
        ...prev,
        storageId,
      }));
      showToast("Image uploaded successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Image upload failed", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle product save
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...prodForm,
        storageId: prodForm.storageId ? (prodForm.storageId as any) : undefined,
      };
      if (editingProduct) {
        await updateProductMut({
          productId: editingProduct._id,
          ...payload,
        });
        showToast("Product updated successfully", "success");
      } else {
        await createProductMut(payload);
        showToast("Product added successfully", "success");
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Handle product delete
  const handleProductDelete = async (product: any) => {
    const confirmed = await confirmDelete(
      `Delete ${product.productName}?`,
      "This action will permanently delete the product from inventory.",
    );
    if (confirmed) {
      try {
        await deleteProductMut({ productId: product._id });
        showToast("Product deleted successfully", "success");
      } catch (err: any) {
        showToast(err.message || "Operation failed", "error");
      }
    }
  };

  // Open user modal
  const openUserModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        userStatus: user.userStatus || "active",
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        role: "employee",
        userStatus: "active",
      });
    }
    setIsUserModalOpen(true);
  };

  // Handle user save
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUserMut({
          userId: editingUser._id,
          ...userForm,
        });
        showToast("User updated successfully", "success");
      } else {
        await createUserMut(userForm);
        showToast("User created successfully", "success");
      }
      setIsUserModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Handle user delete
  const handleUserDelete = async (user: any) => {
    if (currentUser?._id === user._id) {
      showToast("You cannot delete your own profile!", "error");
      return;
    }
    const confirmed = await confirmDelete(
      `Delete user ${user.name || "User"}?`,
      "This user will lose access to the system. Pre-created credentials linked to this email will be affected.",
    );
    if (confirmed) {
      try {
        await deleteUserMut({ userId: user._id });
        showToast("User deleted successfully", "success");
      } catch (err: any) {
        showToast(err.message || "Operation failed", "error");
      }
    }
  };

  // Handle sell order save
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.productId) {
      showToast("Please select a product!", "error");
      return;
    }
    try {
      await createSaleMut({
        productId: saleForm.productId as any,
        quantity: saleForm.quantity,
      });
      showToast("Sell order recorded successfully", "success");
      setIsSaleModalOpen(false);
      setSaleForm({ productId: "", quantity: 1 });
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="bg-slate-950 min-h-screen antialiased flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <img src={logo} alt="MRVAPE" className="w-20 h-20 animate-logo-pulse" />
          <div className="text-slate-400 font-medium tracking-wide">Loading session...</div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const uniqueBrands = companies?.length || 0;
  const outOfStockCount = products?.filter((p) => p.stock === 0).length || 0;
  const inventoryVal =
    products?.reduce((total, p) => total + p.stock * p.price, 0) || 0;

  // Calculate Sales statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlySalesTotal = sales
    ? sales
        .filter((s) => {
          const date = new Date(s.timestamp);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((total, s) => total + s.priceAtSale * s.quantity, 0)
    : 0;

  const yearlySalesTotal = sales
    ? sales
        .filter((s) => {
          const date = new Date(s.timestamp);
          return date.getFullYear() === currentYear;
        })
        .reduce((total, s) => total + s.priceAtSale * s.quantity, 0)
    : 0;

  const monthlySalesQty = sales
    ? sales
        .filter((s) => {
          const date = new Date(s.timestamp);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((total, s) => total + s.quantity, 0)
    : 0;

  const yearlySalesQty = sales
    ? sales
        .filter((s) => {
          const date = new Date(s.timestamp);
          return date.getFullYear() === currentYear;
        })
        .reduce((total, s) => total + s.quantity, 0)
    : 0;

  // Filtered Products
  const filteredProducts =
    products?.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.company.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.flavor.toLowerCase().includes(productSearch.toLowerCase());
      const matchesBrand =
        selectedBrand === "All" || p.company === selectedBrand;
      return matchesSearch && matchesBrand;
    }) || [];

  // Filtered Users
  const filteredUsers =
    allUsers?.filter((u) => {
      return (
        (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(userSearch.toLowerCase())
      );
    }) || [];

  // Filtered Logs
  const filteredLogs =
    activityLogs?.filter((l) => {
      return (
        l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.details.toLowerCase().includes(logSearch.toLowerCase())
      );
    }) || [];

  // Get unique product names matching the selected brand/company
  const availableProductNames = products
    ? Array.from(
        new Set(
          products
            .filter((p) => !prodForm.company || p.company === prodForm.company)
            .map((p) => p.productName)
        )
      )
    : [];

  // Brand-wise Stock Distribution
  const brandStats: { name: string; stock: number }[] = products
    ? Object.entries(
        products.reduce((acc: Record<string, number>, p) => {
          acc[p.company] = (acc[p.company] || 0) + p.stock;
          return acc;
        }, {}),
      ).map(([name, stock]) => ({ name, stock }))
    : [];

  return (
    <div className="bg-slate-950 min-h-screen antialiased flex flex-col md:flex-row text-slate-100">
      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col shrink-0 transition-all duration-300 z-30`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-900/60">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <img
              src={logo}
              alt="MRVAPE"
              className="w-9 h-9 group-hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-xl font-bold tracking-tight text-white">
              MR
              <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                VAPE
              </span>
            </h1>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div
          className={`${mobileMenuOpen ? "block" : "hidden"} md:block flex-1 p-4 space-y-1.5`}
        >
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${page === "dashboard" ? "bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
            onClick={() => {
              setPage("dashboard");
              setMobileMenuOpen(false);
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span>Overview</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${page === "products" ? "bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
            onClick={() => {
              setPage("products");
              setMobileMenuOpen(false);
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span>Products</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${page === "sales" ? "bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
            onClick={() => {
              setPage("sales");
              setMobileMenuOpen(false);
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Sales Orders</span>
          </button>

          {isAdmin && (
            <>
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${page === "users" ? "bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                onClick={() => {
                  setPage("users");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Users</span>
              </button>

              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${page === "logs" ? "bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                onClick={() => {
                  setPage("logs");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <span>Audit Logs</span>
              </button>
            </>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 mt-auto">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-900/80 mb-3">
            <div className="w-9 h-9 rounded-full bg-cyan-600/20 text-cyan-400 font-bold border border-cyan-500/20 flex items-center justify-center shrink-0 uppercase">
              {(currentUser.name || currentUser.email || "U").substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate">
                {currentUser.name || "User Name"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentUser.email}
              </div>
            </div>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${isAdmin ? "bg-indigo-900/30 text-indigo-400 border border-indigo-500/20" : "bg-teal-900/30 text-teal-400 border border-teal-500/20"}`}
            >
              {currentUser.role}
            </span>
          </div>

          <button
            className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-800/40 text-red-400 font-semibold rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            onClick={() => void signOut()}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* OVERVIEW PAGE */}
        {page === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Overview
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Real-time product inventory metrics and auditing logs overview.
              </p>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Card 1: Total Stock */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-300"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Stocks
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1.5 tracking-tight">
                      {totalStock ?? 0}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-cyan-600/10 text-cyan-400 border border-cyan-500/15 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat Card 2: Inventory Value */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/10 transition-all duration-300"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Inventory Value
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1.5 tracking-tight">
                      ₱
                      {inventoryVal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-teal-600/10 text-teal-400 border border-teal-500/15 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat Card 3: Unique Brands */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-300"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Unique Brands
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1.5 tracking-tight">
                      {uniqueBrands}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat Card 4: Out of Stock */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-all duration-300"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Out of Stock
                    </span>
                    <h3
                      className={`text-3xl font-black mt-1.5 tracking-tight ${outOfStockCount > 0 ? "text-red-400" : "text-white"}`}
                    >
                      {outOfStockCount}
                    </h3>
                  </div>
                  <div
                    className={`p-3.5 border rounded-xl ${outOfStockCount > 0 ? "bg-red-600/15 text-red-400 border-red-500/20" : "bg-slate-900/40 text-slate-400 border-slate-800"}`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Visual Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Out of stock lists & distribution */}
              <div className="lg:col-span-1 space-y-6">
                {/* Out of stock box */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-900/80">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Out of Stock Alerts</span>
                  </h4>
                  {outOfStockCount === 0 ? (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/20 text-emerald-400 rounded-xl text-xs text-center">
                      All products are currently in stock!
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-55 overflow-y-auto pr-1">
                      {products
                        ?.filter((p) => p.stock === 0)
                        .map((product) => (
                          <div
                            key={product._id}
                            className="flex justify-between items-center p-2.5 bg-red-950/10 border border-red-950/30 rounded-xl"
                          >
                            <div>
                              <p className="text-xs font-bold text-red-200">
                                {product.productName}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {product.company} • {product.flavor}
                              </p>
                            </div>
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/10 shrink-0">
                              Empty
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Stock per brand box */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-900/80">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Brand Stock Distribution</span>
                  </h4>
                  <div className="space-y-3 max-h-55 overflow-y-auto pr-1">
                    {brandStats.map((brand) => (
                      <div key={brand.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{brand.name}</span>
                          <span className="text-slate-400">
                            {brand.stock} units
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-linear-to-r from-cyan-500 to-teal-400 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (brand.stock / (totalStock || 1)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {brandStats.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        No brand data available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Recent activity log logs */}
              <div className="lg:col-span-2">
                <div className="glass-panel rounded-2xl p-6 border border-slate-900/80 h-full flex flex-col">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>Recent System Activity</span>
                  </h4>

                  {!isAdmin ? (
                    <div className="flex-1 flex items-center justify-center p-8 bg-slate-900/20 border border-slate-800/40 rounded-xl text-xs text-slate-500">
                      Access restricted to administrators only.
                    </div>
                  ) : activityLogs && activityLogs.length > 0 ? (
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-115 pr-1">
                      {activityLogs.slice(0, 6).map((log) => (
                        <div
                          key={log._id}
                          className="p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-900/60 rounded-xl transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1.5 max-w-md">
                            <span className="text-slate-400 block tracking-wide">
                              {log.details}
                            </span>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                              <span className="font-bold text-slate-400">
                                {log.userName}
                              </span>
                              <span>•</span>
                              <span>{log.userEmail}</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-1.5">
                            <span
                              className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-extrabold ${
                                log.action.includes("create")
                                  ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/10"
                                  : log.action.includes("delete")
                                    ? "bg-red-950/30 text-red-400 border border-red-500/10"
                                    : "bg-amber-950/30 text-amber-400 border border-amber-500/10"
                              }`}
                            >
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
                      No system events recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS PAGE */}
        {page === "products" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section with add action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  Products Inventory
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Manage and audit vapes, stock availability, and prices.
                </p>
              </div>
              <button
                className="w-full sm:w-auto px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                onClick={() => openProductModal()}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter and Search controls */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-900/80 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search bar input */}
              <div className="relative w-full md:max-w-sm">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, brand, flavor..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm transition"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {/* Brand filter tabs */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 justify-start md:justify-end">
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${selectedBrand === "All" ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-400" : "bg-slate-900/40 border-slate-900 text-slate-400 hover:text-white"}`}
                  onClick={() => setSelectedBrand("All")}
                >
                  All Brands
                </button>
                {companies?.map((brand) => (
                  <button
                    key={brand}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${selectedBrand === brand ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-400" : "bg-slate-900/40 border-slate-900 text-slate-400 hover:text-white"}`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-900/80 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900/80 bg-slate-900/30 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4.5">Brand</th>
                      <th className="px-6 py-4.5">Product Name</th>
                      <th className="px-6 py-4.5">Flavor</th>
                      <th className="px-6 py-4.5">Description</th>
                      <th className="px-6 py-4.5 text-right">Stock</th>
                      <th className="px-6 py-4.5 text-right">Price (₱)</th>
                      <th className="px-6 py-4.5 text-center">Status</th>
                      <th className="px-6 py-4.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-sm">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-slate-900/20 transition duration-150"
                      >
                        <td className="px-6 py-4 font-bold text-white tracking-wide shrink-0">
                          {product.company}
                        </td>
                        <td className="px-6 py-4 text-slate-200 font-medium">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-cyan-400 border border-slate-800">
                            {product.flavor}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate"
                          title={product.description}
                        >
                          {product.description}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-semibold ${product.stock === 0 ? "text-red-400" : "text-slate-300"}`}
                        >
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-300">
                          ₱{product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {product.stock > 0 ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/20 text-emerald-400 border border-emerald-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Available</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/20 text-red-400 border border-red-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              <span>Empty</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2.5">
                            <button
                              className="p-1.5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-lg transition-all duration-150 cursor-pointer"
                              title="Edit product"
                              onClick={() => openProductModal(product)}
                            >
                              <svg
                                className="w-4.5 h-4.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-150 cursor-pointer"
                              title="Delete product"
                              onClick={() => handleProductDelete(product)}
                            >
                              <svg
                                className="w-4.5 h-4.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-10 text-slate-500 text-sm"
                        >
                          No products found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS PAGE */}
        {page === "users" && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section with add action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  User Management
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Pre-create employees/admins and manage permissions.
                </p>
              </div>
              <button
                className="w-full sm:w-auto px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                onClick={() => openUserModal()}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Add User</span>
              </button>
            </div>

            {/* Filter and Search controls */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-900/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-sm">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm transition"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-900/80 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900/80 bg-slate-900/30 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4.5">Profile Info</th>
                      <th className="px-6 py-4.5">Email Address</th>
                      <th className="px-6 py-4.5 text-center">Role</th>
                      <th className="px-6 py-4.5 text-center">Status</th>
                      <th className="px-6 py-4.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-sm">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-900/20 transition duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/10 font-bold flex items-center justify-center uppercase shrink-0">
                              {(user.name || user.email || "U").substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-200 block truncate max-w-40">
                              {user.name || "Pending Registration"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium font-mono text-xs">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider ${
                              user.role === "admin"
                                ? "bg-indigo-900/30 text-indigo-400 border border-indigo-500/10"
                                : "bg-teal-900/30 text-teal-400 border border-teal-500/10"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.userStatus === "active" && (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/20 text-emerald-400 border border-emerald-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Active</span>
                            </span>
                          )}
                          {user.userStatus === "pending" && (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/20 text-amber-400 border border-amber-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Pending</span>
                            </span>
                          )}
                          {user.userStatus === "inactive" && (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2.5">
                            <button
                              className="p-1.5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-lg transition-all duration-150 cursor-pointer"
                              title="Edit user role & status"
                              onClick={() => openUserModal(user)}
                            >
                              <svg
                                className="w-4.5 h-4.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              className={`p-1.5 rounded-lg transition-all duration-150 ${currentUser._id === user._id ? "opacity-30 cursor-not-allowed text-slate-600" : "hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"}`}
                              title="Delete user"
                              disabled={currentUser._id === user._id}
                              onClick={() => handleUserDelete(user)}
                            >
                              <svg
                                className="w-4.5 h-4.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10 text-slate-500 text-sm"
                        >
                          No users found matching the query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS PAGE */}
        {page === "logs" && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                System Audit Trail
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Trace all database updates, creation events, and deletion
                records chronologically.
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-900/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-sm">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search logs by actor, action, details..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-slate-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm transition"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Logs List Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-900/80 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900/80 bg-slate-900/30 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4.5">Timestamp</th>
                      <th className="px-6 py-4.5">User Profile</th>
                      <th className="px-6 py-4.5 text-center">Action Type</th>
                      <th className="px-6 py-4.5">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-sm">
                    {filteredLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-900/20 transition duration-150 text-xs"
                      >
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">
                              {log.userName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {log.userEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              log.action.includes("create")
                                ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/10"
                                : log.action.includes("delete")
                                  ? "bg-red-950/30 text-red-400 border border-red-500/10"
                                  : "bg-amber-950/30 text-amber-400 border border-amber-500/10"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-slate-500 text-sm"
                        >
                          No audit logs recorded matching search queries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SALES LEDGER PAGE */}
        {page === "sales" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section with add sale action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  Sales Ledger
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Track real-time sell orders, inventory valuation, and sales statistics.
                </p>
              </div>
              <button
                className="w-full sm:w-auto px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                onClick={() => {
                  setSaleForm({ productId: "", quantity: 1 });
                  setIsSaleModalOpen(true);
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add Sell Order</span>
              </button>
            </div>

            {/* Quick Analytics Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Inventory Value Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-900/80 relative overflow-hidden flex flex-col justify-between h-32">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current Inventory Value
                </div>
                <div className="text-3xl font-black text-white tracking-tight mt-2">
                  ₱{inventoryVal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Valued from active products in stock
                </div>
              </div>

              {/* Monthly Sales Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-900/80 relative overflow-hidden flex flex-col justify-between h-32">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  This Month's Sales
                </div>
                <div className="text-3xl font-black text-emerald-400 tracking-tight mt-2">
                  ₱{monthlySalesTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Total of {monthlySalesQty} units sold this month
                </div>
              </div>

              {/* Yearly Sales Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-900/80 relative overflow-hidden flex flex-col justify-between h-32">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  This Year's Sales
                </div>
                <div className="text-3xl font-black text-indigo-400 tracking-tight mt-2">
                  ₱{yearlySalesTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Total of {yearlySalesQty} units sold this year
                </div>
              </div>
            </div>

            {/* Sales Table and Stats filter tab */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-900/80 shadow-2xl">
              {/* Header section with toggle for totals */}
              <div className="px-6 py-5 border-b border-slate-900/80 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
                  Sell Order Table
                </h3>
                <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                  <button
                    onClick={() => setSalesFilter("month")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                      salesFilter === "month"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setSalesFilter("year")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                      salesFilter === "year"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    This Year
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900/80 bg-slate-900/10 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4.5">Date & Time</th>
                      <th className="px-6 py-4.5">Product details</th>
                      <th className="px-6 py-4.5 text-center">Qty Sold</th>
                      <th className="px-6 py-4.5 text-right">Unit Price</th>
                      <th className="px-6 py-4.5 text-right">Total revenue</th>
                      <th className="px-6 py-4.5 text-center">Seller</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-sm">
                    {(sales || [])
                      .filter((s) => {
                        const date = new Date(s.timestamp);
                        if (salesFilter === "month") {
                          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                        }
                        return date.getFullYear() === currentYear;
                      })
                      .map((sale) => (
                        <tr key={sale._id} className="hover:bg-slate-900/20 transition duration-150">
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                            {new Date(sale.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200">
                                {sale.productName}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                                {sale.company} &bull; {sale.flavor}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-300">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                            ₱{sale.priceAtSale.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold font-mono text-xs text-cyan-400">
                            ₱{(sale.priceAtSale * sale.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-[10px] text-slate-400 font-semibold">
                              {sale.sellerName || "System"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {(!sales || sales.length === 0) && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                          No sales recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT CREATION/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
              <h3 className="text-lg font-bold text-white">
                {editingProduct
                  ? `Edit Product: ${editingProduct.productName}`
                  : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Brand/Company
                    </label>
                    {showNewCompanyInput && companies && companies.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCompanyInput(false);
                          setProdForm((prev) => ({ ...prev, company: "" }));
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                      >
                        Choose Existing
                      </button>
                    )}
                  </div>
                  {companies && companies.length > 0 && !showNewCompanyInput ? (
                    <div className="relative w-full">
                      <select
                        required
                        className="w-full px-3.5 py-2.5 input-premium text-white bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none pr-10"
                        value={prodForm.company}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setShowNewCompanyInput(true);
                            setProdForm((prev) => ({ ...prev, company: "", productName: "" }));
                          } else {
                            setProdForm((prev) => ({ ...prev, company: e.target.value }));
                          }
                        }}
                      >
                        <option value="" disabled>Select a Brand...</option>
                        {companies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__NEW__" className="text-cyan-400 font-semibold">
                          + Add New Brand...
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Relx, Waka"
                      className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                      value={prodForm.company}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, company: e.target.value })
                      }
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Product Name
                    </label>
                    {showNewProductNameInput && availableProductNames.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewProductNameInput(false);
                          setProdForm((prev) => ({ ...prev, productName: "" }));
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                      >
                        Choose Existing
                      </button>
                    )}
                  </div>
                  {availableProductNames.length > 0 && !showNewProductNameInput ? (
                    <div className="relative w-full">
                      <select
                        required
                        className="w-full px-3.5 py-2.5 input-premium text-white bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none pr-10"
                        value={prodForm.productName}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setShowNewProductNameInput(true);
                            setProdForm((prev) => ({ ...prev, productName: "" }));
                          } else {
                            setProdForm((prev) => ({ ...prev, productName: e.target.value }));
                          }
                        }}
                      >
                        <option value="" disabled>Select a Product Name...</option>
                        {availableProductNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="__NEW__" className="text-cyan-400 font-semibold">
                          + Add New Product...
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Infinity, Smash"
                      className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                      value={prodForm.productName}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, productName: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Flavor
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mint, Grape"
                    className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                    value={prodForm.flavor}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, flavor: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="15.99"
                    className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                    value={prodForm.price || ""}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                    value={prodForm.stock || 0}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Upload Image File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer hover:bg-slate-800 hover:border-slate-700 transition flex items-center justify-center space-x-2 h-[45px] select-none"
                    >
                      {isUploadingImage ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Choose Image File</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/vape.png"
                    className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm h-[45px]"
                    value={prodForm.imageUrl}
                    onChange={(e) => {
                      setProdForm({ ...prodForm, imageUrl: e.target.value, storageId: "" });
                      setImagePreview(e.target.value || null);
                    }}
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="space-y-1.5 animate-fade-in">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Image Preview</span>
                  <div className="relative w-28 h-28 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center group/preview">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 rounded-lg text-white transition cursor-pointer shadow-lg"
                      onClick={() => {
                        setImagePreview(null);
                        setProdForm(prev => ({ ...prev, imageUrl: "", storageId: "" }));
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Description <span className="text-[10px] text-slate-500 font-normal lowercase">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide specifications, nicotine volume, etc..."
                  className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm resize-none"
                  value={prodForm.description}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-sm font-semibold rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition duration-150 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT MODAL */}
      {isUserModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
              <h3 className="text-lg font-bold text-white">
                {editingUser
                  ? `Edit User: ${editingUser.name || "New Account"}`
                  : "Pre-Create User Account"}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              {!editingUser && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/20 text-cyan-400 rounded-xl text-xs leading-normal">
                  <strong>Notice:</strong> Pre-creating a profile creates an
                  entry in the system. When employees register on the sign-up
                  page with a matching email, their password account will link
                  here, inheriting the assigned role and active status.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Cooper"
                  className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="employee@mrvape.com"
                  className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 font-mono text-xs"
                  value={userForm.email}
                  disabled={!!editingUser} // Prevent changing email on active accounts to maintain index integrity
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Role
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 input-premium text-white bg-slate-900 border border-slate-800 rounded-xl text-sm"
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as "employee" | "admin",
                      })
                    }
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Account Status
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 input-premium text-white bg-slate-900 border border-slate-800 rounded-xl text-sm"
                    value={userForm.userStatus}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        userStatus: e.target.value as
                          | "active"
                          | "inactive"
                          | "pending",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="inactive">Inactive / Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-sm font-semibold rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition duration-150 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD SELL ORDER MODAL */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
              <h3 className="text-lg font-bold text-white">Record Sell Order</h3>
              <button
                onClick={() => setIsSaleModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaleSubmit} className="p-6 space-y-4">
              {/* Product selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Select Product to Sell
                </label>
                <div className="relative w-full">
                  <select
                    required
                    className="w-full px-3.5 py-2.5 input-premium text-white bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none pr-10"
                    value={saleForm.productId}
                    onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                  >
                    <option value="" disabled>Select a product...</option>
                    {(products || [])
                      .filter((p) => p.stock > 0)
                      .map((p) => (
                        <option key={p._id} value={p._id} className="bg-slate-950 text-slate-350">
                          {p.company} - {p.productName} - {p.flavor} (₱{p.price.toFixed(2)}, {p.stock} units left)
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Quantity Sold
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    saleForm.productId
                      ? (products?.find((p) => p._id === saleForm.productId)?.stock || 1)
                      : undefined
                  }
                  required
                  placeholder="e.g. 1"
                  className="w-full px-3.5 py-2.5 input-premium text-white placeholder-slate-600 text-sm font-semibold"
                  value={saleForm.quantity}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
                {saleForm.productId && (
                  <span className="text-[10px] text-slate-500 block">
                    * Max available: {products?.find((p) => p._id === saleForm.productId)?.stock || 0} units
                  </span>
                )}
              </div>

              {/* Price preview display */}
              {saleForm.productId && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Total Sales Value</span>
                  <span className="text-cyan-400 font-bold font-mono text-sm">
                    ₱
                    {(
                      (products?.find((p) => p._id === saleForm.productId)?.price || 0) *
                      saleForm.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-sm font-semibold rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition duration-150 cursor-pointer"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
