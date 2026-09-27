import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import type {
  OnErrorPolicy,
  PreviewResolution,
  SettingsState,
} from "@/features/settings/types";

interface ProcessingSettingsSectionProps {
  draft: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function ProcessingSettingsSection({
  draft,
  onUpdateSetting,
}: ProcessingSettingsSectionProps) {
  const { t } = useTranslation("settings");

  return (
    <>
      <SettingSection label={t("processing.sections.performance")}>
        <SettingGroup>
          <SettingRow
            name={t("processing.workers.name")}
            description="processing.workers.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.workers.toString()}
              onValueChange={(v) => onUpdateSetting("workers", parseInt(v, 10))}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("processing.workersOptions.1")}</SelectItem>
                <SelectItem value="2">{t("processing.workersOptions.2")}</SelectItem>
                <SelectItem value="4">{t("processing.workersOptions.4")}</SelectItem>
                <SelectItem value="8">{t("processing.workersOptions.8")}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("processing.memoryLimit.name")}
            description="processing.memoryLimit.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.memoryLimit}
              onValueChange={(v) => onUpdateSetting("memoryLimit", v)}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256 MB">256 MB</SelectItem>
                <SelectItem value="512 MB">512 MB</SelectItem>
                <SelectItem value="1 GB">1 GB</SelectItem>
                <SelectItem value="Unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("processing.diskCacheLimit.name")}
            description="processing.diskCacheLimit.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.diskCacheLimit}
              onValueChange={(v) => onUpdateSetting("diskCacheLimit", v)}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512 MB">512 MB</SelectItem>
                <SelectItem value="1 GB">1 GB</SelectItem>
                <SelectItem value="2 GB">2 GB</SelectItem>
                <SelectItem value="Unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("processing.sections.preview")}>
        <SettingGroup>
          <SettingRow
            name={t("processing.livePreview.name")}
            description="processing.livePreview.description"
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.livePreview}
              onCheckedChange={(v) => onUpdateSetting("livePreview", v)}
            />
          </SettingRow>

          <SettingRow
            name={t("processing.previewMaxResolution.name")}
            description="processing.previewMaxResolution.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.previewMaxResolution}
              onValueChange={(v) =>
                onUpdateSetting("previewMaxResolution", v as PreviewResolution)
              }
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="800px">
                  {t("processing.previewResolutionOptions.800px")}
                </SelectItem>
                <SelectItem value="1200px">
                  {t("processing.previewResolutionOptions.1200px")}
                </SelectItem>
                <SelectItem value="full">
                  {t("processing.previewResolutionOptions.full")}
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("processing.sections.batchSafety")}>
        <SettingGroup>
          <SettingRow
            name={t("processing.dryRunBeforeBatch.name")}
            description="processing.dryRunBeforeBatch.description"
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.dryRunBeforeBatch}
              onCheckedChange={(v) => onUpdateSetting("dryRunBeforeBatch", v)}
            />
          </SettingRow>

          <SettingRow
            name={t("processing.onErrorPolicy.name")}
            description="processing.onErrorPolicy.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.onErrorPolicy}
              onValueChange={(v) =>
                onUpdateSetting("onErrorPolicy", v as OnErrorPolicy)
              }
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip-and-continue">
                  {t("general.onErrorPolicies.skip-and-continue")}
                </SelectItem>
                <SelectItem value="stop-all">
                  {t("general.onErrorPolicies.stop-all")}
                </SelectItem>
                <SelectItem value="retry-once">
                  {t("general.onErrorPolicies.retry-once")}
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("processing.saveErrorLog.name")}
            description="processing.saveErrorLog.description"
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.saveErrorLog}
              onCheckedChange={(v) => onUpdateSetting("saveErrorLog", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </>
  );
}
