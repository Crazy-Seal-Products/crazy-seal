import { NextRequest, NextResponse } from 'next/server'
import { MediaConvertClient, GetJobCommand } from '@aws-sdk/client-mediaconvert'

const mediaConvertClient = new MediaConvertClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.MEDIACONVERT_ENDPOINT,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing required parameter: jobId' },
        { status: 400 }
      )
    }

    const command = new GetJobCommand({ Id: jobId })
    const response = await mediaConvertClient.send(command)

    const job = response.Job
    const outputFiles = job?.OutputGroupDetails?.flatMap(group =>
      group.OutputDetails?.map(output => ({
        durationInMs: output.DurationInMs,
        videoDetails: output.VideoDetails,
      })) || []
    ) || []

    return NextResponse.json({
      jobId: job?.Id,
      status: job?.Status,
      statusUpdateInterval: job?.StatusUpdateInterval,
      errorCode: job?.ErrorCode,
      errorMessage: job?.ErrorMessage,
      createdAt: job?.CreatedAt,
      outputFiles,
      percentComplete: job?.JobPercentComplete,
    })
  } catch (error) {
    console.error('MediaConvert status check failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    )
  }
}
