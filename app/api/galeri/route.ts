import { NextRequest, NextResponse } from "next/server";
import { getGaleriList, addGaleri, deleteGaleri } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(_: NextRequest) {
  try {
    const list = await getGaleriList();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch galeri list:", error);
    return NextResponse.json({ error: "Failed to fetch galeri list" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { label, cat, grad, image, desc } = await req.json();

    if (!label || !cat) {
      return NextResponse.json({ error: "Missing required fields: label, cat" }, { status: 400 });
    }

    const newItem = {
      label,
      cat,
      grad: grad || "",
      image,
      desc,
    };

    const saved = await addGaleri(newItem);

    revalidatePath("/");
    revalidatePath("/galeri");

    return NextResponse.json({ success: true, item: saved });
  } catch (error) {
    console.error("Failed to add galeri via API:", error);
    return NextResponse.json({ error: "Failed to add galeri" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    let idParam = url.searchParams.get("id");

    if (!idParam) {
      try {
        const body = await req.json();
        idParam = body.id;
      } catch (e) {
        // Body empty or invalid JSON
      }
    }

    const numId = idParam ? parseInt(idParam, 10) : NaN;
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Missing or invalid required field: id" }, { status: 400 });
    }

    const success = await deleteGaleri(numId);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete galeri" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/galeri");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete galeri via API:", error);
    return NextResponse.json({ error: "Failed to delete galeri" }, { status: 500 });
  }
}
