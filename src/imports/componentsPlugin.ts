import type {App} from 'vue'

import WActionsBar from '@/components/ActionsBar/WActionsBar.vue'
import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WButton from '@/components/Button/WButton.vue'
import WButtonAction from '@/components/Button/WButtonAction.vue'
import WButtonCopy from '@/components/Button/WButtonCopy.vue'
import WButtonDropdown from '@/components/Button/WButtonDropdown.vue'
import WButtonGroup from '@/components/Button/WButtonGroup.vue'
import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WChip from '@/components/Chip/WChip.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WCounter from '@/components/Counter/WCounter.vue'
import WDatePicker from '@/components/DatePicker/WDatePicker.vue'
import WDatePickerSingle from '@/components/DatePicker/WDatePickerSingle.vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'
import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'
import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'
import WFilePicker from '@/components/FilePicker/WFilePicker.vue'
import WFilterWrapper from '@/components/FilterWrapper/WFilterWrapper.vue'
import WForm from '@/components/Form/WForm.vue'
import WFormValidator from '@/components/Form/WFormValidator.vue'
import WFormAsyncButtonGroup from '@/components/FormAsync/WFormAsyncButtonGroup.vue'
import WFormAsyncInput from '@/components/FormAsync/WFormAsyncInput.vue'
import WFormAsyncSelect from '@/components/FormAsync/WFormAsyncSelect.vue'
import WFormAsyncSelectInfiniteSingle from '@/components/FormAsync/WFormAsyncSelectInfiniteSingle.vue'
import WFormAsyncSelectSingle from '@/components/FormAsync/WFormAsyncSelectSingle.vue'
import WFormAsyncToggle from '@/components/FormAsync/WFormAsyncToggle.vue'
import WHeaderBar from '@/components/HeaderBar/WHeaderBar.vue'
import WImageViewer from '@/components/ImageViewer/WImageViewer.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import WInfiniteListPages from '@/components/InfiniteList/WInfiniteListPages.vue'
import WInfoCard from '@/components/InfoCard/WInfoCard.vue'
import WInfoCardNegative from '@/components/InfoCard/WInfoCardNegative.vue'
import WInput from '@/components/Input/WInput.vue'
import WInputAsync from '@/components/Input/WInputAsync.vue'
import WInputDate from '@/components/Input/WInputDate.vue'
import WInputOptions from '@/components/Input/WInputOptions.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import WLink from '@/components/Link/WLink.vue'
import WLinkArrow from '@/components/Link/WLinkArrow.vue'
import WList from '@/components/List/WList.vue'
import WListCard from '@/components/List/WListCard.vue'
import WListCardField from '@/components/List/WListCardField.vue'
import WListHeader from '@/components/List/WListHeader.vue'
import WListHeaderItem from '@/components/List/WListHeaderItem.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'
import WModal from '@/components/Modal/WModal.vue'
import WModalStepper from '@/components/Modal/WModalStepper.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WNavBar from '@/components/Nav/WNavBar.vue'
import WNavItem from '@/components/Nav/WNavItem.vue'
import WNavItemExpand from '@/components/Nav/WNavItemExpand.vue'
import WNavItemTransition from '@/components/Nav/WNavItemTransition.vue'
import WNotify from '@/components/Notify/WNotify.vue'
import WSelect from '@/components/Select/WSelect.vue'
import WSelectAsync from '@/components/Select/WSelectAsync.vue'
import WSelectAsyncList from '@/components/Select/WSelectAsyncList.vue'
import WSelectAsyncSingle from '@/components/Select/WSelectAsyncSingle.vue'
import WSelectSingle from '@/components/Select/WSelectSingle.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTabs from '@/components/Tabs/WTabs.vue'
import WTabsColumns from '@/components/Tabs/WTabsColumns.vue'
import WToggle from '@/components/Toggle/WToggle.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import WTooltipContainer from '@/components/Tooltip/WTooltipContainer.vue'

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install: (app: App | any) => {
    app.component('WActionsBar', WActionsBar)
    app.component('WBottomSheet', WBottomSheet)
    app.component('WButton', WButton)
    app.component('WButtonAction', WButtonAction)
    app.component('WButtonCopy', WButtonCopy)
    app.component('WButtonDropdown', WButtonDropdown)
    app.component('WButtonGroup', WButtonGroup)
    app.component('WButtonMore', WButtonMore)
    app.component('WButtonMoreItem', WButtonMoreItem)
    app.component('WButtonSelection', WButtonSelection)
    app.component('WButtonSelectionAction', WButtonSelectionAction)
    app.component('WCheckbox', WCheckbox)
    app.component('WChip', WChip)
    app.component('WClickOutside', WClickOutside)
    app.component('WCounter', WCounter)
    app.component('WDatePicker', WDatePicker)
    app.component('WDatePickerSingle', WDatePickerSingle)
    app.component('WDropdown', WDropdown)
    app.component('WDropdownMenu', WDropdownMenu)
    app.component('WExpansion', WExpansion)
    app.component('WExpansionItem', WExpansionItem)
    app.component('WFieldWrapper', WFieldWrapper)
    app.component('WFilePicker', WFilePicker)
    app.component('WFilterWrapper', WFilterWrapper)
    app.component('WForm', WForm)
    app.component('WFormValidator', WFormValidator)
    app.component('WFormAsyncButtonGroup', WFormAsyncButtonGroup)
    app.component('WFormAsyncInput', WFormAsyncInput)
    app.component('WFormAsyncSelect', WFormAsyncSelect)
    app.component('WFormAsyncSelectInfiniteSingle', WFormAsyncSelectInfiniteSingle)
    app.component('WFormAsyncSelectSingle', WFormAsyncSelectSingle)
    app.component('WFormAsyncToggle', WFormAsyncToggle)
    app.component('WHeaderBar', WHeaderBar)
    app.component('WImageViewer', WImageViewer)
    app.component('WInfiniteList', WInfiniteList)
    app.component('WInfiniteListPages', WInfiniteListPages)
    app.component('WInfoCard', WInfoCard)
    app.component('WInfoCardNegative', WInfoCardNegative)
    app.component('WInput', WInput)
    app.component('WInputAsync', WInputAsync)
    app.component('WInputDate', WInputDate)
    app.component('WInputOptions', WInputOptions)
    app.component('WInputSuggest', WInputSuggest)
    app.component('WLink', WLink)
    app.component('WLinkArrow', WLinkArrow)
    app.component('WList', WList)
    app.component('WListCard', WListCard)
    app.component('WListCardField', WListCardField)
    app.component('WListHeader', WListHeader)
    app.component('WListHeaderItem', WListHeaderItem)
    app.component('WMenuItem', WMenuItem)
    app.component('WModal', WModal)
    app.component('WModalStepper', WModalStepper)
    app.component('WModalWrapper', WModalWrapper)
    app.component('WNavBar', WNavBar)
    app.component('WNavItem', WNavItem)
    app.component('WNavItemExpand', WNavItemExpand)
    app.component('WNavItemTransition', WNavItemTransition)
    app.component('WNotify', WNotify)
    app.component('WSelect', WSelect)
    app.component('WSelectAsync', WSelectAsync)
    app.component('WSelectAsyncList', WSelectAsyncList)
    app.component('WSelectAsyncSingle', WSelectAsyncSingle)
    app.component('WSelectSingle', WSelectSingle)
    app.component('WSkeleton', WSkeleton)
    app.component('WSpinner', WSpinner)
    app.component('WTabs', WTabs)
    app.component('WTabsColumns', WTabsColumns)
    app.component('WToggle', WToggle)
    app.component('WTooltip', WTooltip)
    app.component('WTooltipContainer', WTooltipContainer)
  },
}

export {
  WActionsBar,
  WBottomSheet,
  WButton,
  WButtonAction,
  WButtonCopy,
  WButtonDropdown,
  WButtonGroup,
  WButtonMore,
  WButtonMoreItem,
  WButtonSelection,
  WButtonSelectionAction,
  WCheckbox,
  WChip,
  WClickOutside,
  WCounter,
  WDatePicker,
  WDatePickerSingle,
  WDropdown,
  WDropdownMenu,
  WExpansion,
  WExpansionItem,
  WFieldWrapper,
  WFilePicker,
  WFilterWrapper,
  WForm,
  WFormValidator,
  WFormAsyncButtonGroup,
  WFormAsyncInput,
  WFormAsyncSelect,
  WFormAsyncSelectInfiniteSingle,
  WFormAsyncSelectSingle,
  WFormAsyncToggle,
  WHeaderBar,
  WImageViewer,
  WInfiniteList,
  WInfiniteListPages,
  WInfoCard,
  WInfoCardNegative,
  WInput,
  WInputAsync,
  WInputDate,
  WInputOptions,
  WInputSuggest,
  WLink,
  WLinkArrow,
  WList,
  WListCard,
  WListCardField,
  WListHeader,
  WListHeaderItem,
  WMenuItem,
  WModal,
  WModalStepper,
  WModalWrapper,
  WNavBar,
  WNavItem,
  WNavItemExpand,
  WNavItemTransition,
  WNotify,
  WSelect,
  WSelectAsync,
  WSelectAsyncList,
  WSelectAsyncSingle,
  WSelectSingle,
  WSkeleton,
  WSpinner,
  WTabs,
  WTabsColumns,
  WToggle,
  WTooltip,
  WTooltipContainer,
}