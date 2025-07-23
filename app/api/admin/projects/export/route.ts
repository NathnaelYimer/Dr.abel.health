import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { createObjectCsvStringifier } from 'csv-writer'
import { format } from 'date-fns'

export async function GET(request: Request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'ADMIN' || 
      ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get('format') || 'json' // 'json' or 'csv'
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build the where clause
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    // Get projects with related data
    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        updatedBy: {
          select: { name: true, email: true }
        },
        teamMembers: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { status: true, progress: true, createdAt: true }
        },
        _count: {
          select: { updates: true, teamMembers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the data for export
    const formattedData = projects.map(project => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      type: project.type,
      status: project.status,
      progress: project.progress,
      priority: project.priority,
      startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
      endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
      budget: project.budget,
      client: project.client || '',
      location: project.location || '',
      impact: project.impact || '',
      beneficiaries: project.beneficiaries || '',
      fundingSource: project.fundingSource || '',
      objectives: project.objectives.join('; '),
      outcomes: project.outcomes.join('; '),
      partners: project.partners.join(', '),
      teamSize: project._count.teamMembers,
      updatesCount: project._count.updates,
      lastUpdate: project.updates[0]?.createdAt ? format(new Date(project.updates[0].createdAt), 'yyyy-MM-dd HH:mm') : 'No updates',
      lastStatus: project.updates[0]?.status || project.status,
      lastProgress: project.updates[0]?.progress || project.progress,
      featured: project.featured ? 'Yes' : 'No',
      published: project.published ? 'Yes' : 'No',
      tags: project.tags.join(', '),
      createdBy: project.createdBy?.name || 'Unknown',
      createdAt: format(new Date(project.createdAt), 'yyyy-MM-dd HH:mm'),
      updatedBy: project.updatedBy?.name || 'Unknown',
      updatedAt: format(new Date(project.updatedAt), 'yyyy-MM-dd HH:mm')
    }))

    // Return data in requested format
    if (formatType.toLowerCase() === 'csv') {
      // Create CSV stringifier
      const csvStringifier = createObjectCsvStringifier({
        header: Object.keys(formattedData[0] || {}).map(key => ({
          id: key,
          title: key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
        }))
      })

      // Generate CSV content
      const header = csvStringifier.getHeaderString()
      const rows = csvStringifier.stringifyRecords(formattedData)
      const csvContent = header + rows

      // Create a response with CSV content
      const response = new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=projects_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
        }
      })

      return response
    }

    // Default to JSON format
    return NextResponse.json({
      data: formattedData,
      meta: {
        exportedAt: new Date().toISOString(),
        total: formattedData.length,
        filters: { status, type }
      }
    })
  } catch (error) {
    console.error('Error exporting projects:', error)
    return NextResponse.json(
      { error: 'Failed to export projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
