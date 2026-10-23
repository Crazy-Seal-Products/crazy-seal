import {
  ContentRequestSection,
  ModuleNext,
  type ModuleFooterLink,
} from '@/components/pro/ProgramModule'

interface AssetPageFooterProps {
  sourcePage: string
  back?: ModuleFooterLink
  next?: ModuleFooterLink
  /** Business Accelerator module this asset page belongs to (highlights it in the module map). */
  module?: number
}

/**
 * Shared footer for Business Accelerator asset sub-pages: the "up next" card
 * with optional back link, the Module Quick Links map, and the
 * content/feature request form.
 */
export function AssetPageFooter({ sourcePage, back, next, module }: AssetPageFooterProps) {
  return (
    <>
      <ModuleNext current={module} back={back} next={next} />
      <ContentRequestSection sourcePage={sourcePage} />
    </>
  )
}
