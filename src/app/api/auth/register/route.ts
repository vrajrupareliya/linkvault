import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { error } from 'console';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    const {username, email, password } = await request.json();


    try {
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'all fields are required'},
                { status: 400 }
            );
        }
    
    } catch (error) {
        console.error('error validating input:', error);
        return NextResponse.json(
            { error: 'error validating input' },
            { status: 500 }
        );
    }
    
    const existingUser = await prisma.user.findUnique({where:{email}});

    try {
            if (existingUser) {
                return NextResponse.json(
                    { error: 'user already exists'},
                    { status: 400 }
                );
            }
        } 
    catch (error) {
        console.error('error checking existing user:', error);
        return NextResponse.json(
            { error: 'error checking existing user' },
            { status: 500 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
    return NextResponse.json({
            username,
            id: user.id,
            email: user.email,
          }, 
            { status: 201 });
    
    } catch (error) {
        console.error('error registering user:', error);
        return NextResponse.json(
            { error: 'error registering user' },
            { status: 500 }
        );
    }
    
}
